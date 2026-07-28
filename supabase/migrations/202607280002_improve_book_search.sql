create or replace function public.normalize_search_text(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent(coalesce(value, '')));
$$;

create index if not exists books_name_search_trgm_idx
on public.books using gin (
  public.normalize_search_text(name) extensions.gin_trgm_ops
);

create index if not exists books_publisher_search_trgm_idx
on public.books using gin (
  public.normalize_search_text(publisher) extensions.gin_trgm_ops
);

create index if not exists writers_name_search_trgm_idx
on public.writers using gin (
  public.normalize_search_text(name) extensions.gin_trgm_ops
);

create index if not exists categories_name_search_trgm_idx
on public.categories using gin (
  public.normalize_search_text(name) extensions.gin_trgm_ops
);

create or replace function public.search_books(
  search_term text,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  id uuid,
  name text,
  slug text,
  writer_id uuid,
  category_id uuid,
  writer jsonb,
  category jsonb,
  publisher text,
  isbn text,
  language text,
  pages integer,
  edition text,
  stock integer,
  description text,
  regular_price numeric,
  discount_price numeric,
  cover_url text,
  featured boolean,
  trending boolean,
  new_arrival boolean,
  best_seller boolean,
  is_active boolean,
  view_count bigint,
  sold_count bigint,
  seo_title text,
  seo_description text,
  created_at timestamptz,
  rating numeric,
  review_count bigint,
  total_count bigint
)
language sql
stable
set search_path = ''
as $$
  with input as (
    select btrim(
      regexp_replace(
        public.normalize_search_text(search_term),
        '[^[:alnum:]]+',
        ' ',
        'g'
      )
    ) as term
  ),
  prepared as (
    select
      i.term,
      char_length(i.term) as term_length,
      replace(
        replace(
          replace(i.term, E'\\', E'\\\\'),
          '%',
          E'\\%'
        ),
        '_',
        E'\\_'
      ) as term_like,
      websearch_to_tsquery('simple', i.term) as full_query,
      (
        select to_tsquery(
          'simple',
          string_agg(quote_literal(token) || ':*', ' & ')
        )
        from unnest(
          tsvector_to_array(to_tsvector('simple', i.term))
        ) as tokens(token)
      ) as prefix_query
    from input i
    where i.term <> ''
  ),
  searchable as (
    select
      b.*,
      jsonb_build_object(
        'id', w.id,
        'name', w.name,
        'slug', w.slug,
        'photo_url', w.photo_url
      ) as writer_json,
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug
      ) as category_json,
      public.normalize_search_text(b.name) as title_text,
      public.normalize_search_text(coalesce(w.name, '')) as writer_text,
      public.normalize_search_text(coalesce(c.name, '')) as category_text,
      public.normalize_search_text(coalesce(b.publisher, '')) as publisher_text
    from public.books b
    left join public.writers w on w.id = b.writer_id
    left join public.categories c on c.id = b.category_id
    where b.is_active
  ),
  scored as (
    select
      s.*,
      p.term_length,
      prefix_match.score as prefix_score,
      contains_match.score as contains_score,
      greatest(
        coalesce(ts_rank_cd(s.search_vector, p.full_query), 0),
        coalesce(ts_rank_cd(s.search_vector, p.prefix_query), 0) * 0.9
      ) as full_text_score,
      fuzzy_match.score as fuzzy_score
    from searchable s
    cross join prepared p
    left join lateral (
      select max(candidate.score) as score
      from (
        select
          4.0 + p.term_length::numeric /
            greatest(char_length(word), p.term_length, 1) as score
        from regexp_split_to_table(
          s.title_text,
          '[^[:alnum:]]+'
        ) as title_words(word)
        where word ilike p.term_like || '%' escape E'\\'

        union all

        select
          3.9 + p.term_length::numeric /
            greatest(char_length(word), p.term_length, 1)
        from regexp_split_to_table(
          s.writer_text,
          '[^[:alnum:]]+'
        ) as writer_words(word)
        where word ilike p.term_like || '%' escape E'\\'

        union all

        select
          3.6 + p.term_length::numeric /
            greatest(char_length(word), p.term_length, 1)
        from regexp_split_to_table(
          s.category_text,
          '[^[:alnum:]]+'
        ) as category_words(word)
        where word ilike p.term_like || '%' escape E'\\'

        union all

        select
          3.4 + p.term_length::numeric /
            greatest(char_length(word), p.term_length, 1)
        from regexp_split_to_table(
          s.publisher_text,
          '[^[:alnum:]]+'
        ) as publisher_words(word)
        where word ilike p.term_like || '%' escape E'\\'

        union all

        select
          4.0 + p.term_length::numeric /
            greatest(char_length(s.title_text), p.term_length, 1)
        where regexp_replace(
          s.title_text,
          '[^[:alnum:]]+',
          ' ',
          'g'
        ) ilike p.term_like || '%' escape E'\\'

        union all

        select
          3.9 + p.term_length::numeric /
            greatest(char_length(s.writer_text), p.term_length, 1)
        where regexp_replace(
          s.writer_text,
          '[^[:alnum:]]+',
          ' ',
          'g'
        ) ilike p.term_like || '%' escape E'\\'

        union all

        select
          3.6 + p.term_length::numeric /
            greatest(char_length(s.category_text), p.term_length, 1)
        where regexp_replace(
          s.category_text,
          '[^[:alnum:]]+',
          ' ',
          'g'
        ) ilike p.term_like || '%' escape E'\\'

        union all

        select
          3.4 + p.term_length::numeric /
            greatest(char_length(s.publisher_text), p.term_length, 1)
        where regexp_replace(
          s.publisher_text,
          '[^[:alnum:]]+',
          ' ',
          'g'
        ) ilike p.term_like || '%' escape E'\\'
      ) candidate
    ) prefix_match on true
    cross join lateral (
      select greatest(
        case
          when s.title_text ilike '%' || p.term_like || '%' escape E'\\'
            then 4.0 + p.term_length::numeric /
              greatest(char_length(s.title_text), p.term_length, 1)
          else 0
        end,
        case
          when s.writer_text ilike '%' || p.term_like || '%' escape E'\\'
            then 3.9 + p.term_length::numeric /
              greatest(char_length(s.writer_text), p.term_length, 1)
          else 0
        end,
        case
          when s.category_text ilike '%' || p.term_like || '%' escape E'\\'
            then 3.6 + p.term_length::numeric /
              greatest(char_length(s.category_text), p.term_length, 1)
          else 0
        end,
        case
          when s.publisher_text ilike '%' || p.term_like || '%' escape E'\\'
            then 3.4 + p.term_length::numeric /
              greatest(char_length(s.publisher_text), p.term_length, 1)
          else 0
        end
      ) as score
    ) contains_match
    cross join lateral (
      select greatest(
        extensions.similarity(s.title_text, p.term),
        extensions.word_similarity(p.term, s.title_text),
        extensions.similarity(s.writer_text, p.term) * 0.95,
        extensions.word_similarity(p.term, s.writer_text) * 0.95,
        extensions.similarity(s.category_text, p.term) * 0.8,
        extensions.word_similarity(p.term, s.category_text) * 0.8,
        extensions.similarity(s.publisher_text, p.term) * 0.7,
        extensions.word_similarity(p.term, s.publisher_text) * 0.7
      ) as score
    ) fuzzy_match
  ),
  ranked as (
    select
      s.*,
      case
        when s.prefix_score is not null then 1
        when s.contains_score > 0 then 2
        when s.full_text_score > 0 then 3
        else 4
      end as match_tier,
      case
        when s.prefix_score is not null then s.prefix_score
        when s.contains_score > 0 then s.contains_score
        when s.full_text_score > 0 then s.full_text_score
        else s.fuzzy_score
      end as match_score
    from scored s
    where
      s.prefix_score is not null
      or s.contains_score > 0
      or s.full_text_score > 0
      or (
        s.term_length >= 3
        and s.fuzzy_score >
          case when s.term_length <= 4 then 0.25 else 0.18 end
      )
  ),
  paged as (
    select
      r.*,
      count(*) over() as matched_count
    from ranked r
    order by
      r.match_tier,
      r.match_score desc,
      r.sold_count desc,
      r.name
    limit least(greatest(result_limit, 1), 100)
    offset greatest(result_offset, 0)
  )
  select
    p.id,
    p.name,
    p.slug,
    p.writer_id,
    p.category_id,
    p.writer_json,
    p.category_json,
    p.publisher,
    p.isbn,
    p.language,
    p.pages,
    p.edition,
    p.stock,
    p.description,
    p.regular_price,
    p.discount_price,
    p.cover_url,
    p.featured,
    p.trending,
    p.new_arrival,
    p.best_seller,
    p.is_active,
    p.view_count,
    p.sold_count,
    p.seo_title,
    p.seo_description,
    p.created_at,
    round(coalesce(review_stats.average_rating, 0), 1),
    coalesce(review_stats.review_count, 0),
    p.matched_count
  from paged p
  left join lateral (
    select
      avg(r.rating) filter (where r.is_approved) as average_rating,
      count(r.id) filter (where r.is_approved) as review_count
    from public.reviews r
    where r.book_id = p.id
  ) review_stats on true
  order by
    p.match_tier,
    p.match_score desc,
    p.sold_count desc,
    p.name;
$$;

grant execute on function public.normalize_search_text(text)
to anon, authenticated;

grant execute on function public.search_books(text, integer, integer)
to anon, authenticated;
