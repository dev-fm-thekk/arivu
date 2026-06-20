## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `email` | `text` |  Unique |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `sub_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `category_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question` | `text` |  |
| `options` | `jsonb` |  |
| `answer` | `text` |  |
| `explanation` | `text` |  Nullable |
| `sub_category_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `tests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `sections` | `_text` |  |
| `duration` | `int4` |  |
| `total_questions` | `int4` |  |
| `correct_mark` | `numeric` |  |
| `negative_mark` | `numeric` |  |
| `total_score` | `numeric` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `test_id` | `uuid` | Primary |
| `user_id` | `uuid` | Primary |
| `status` | `attempt_status` |  |
| `questions` | `jsonb` |  |
| `answers` | `jsonb` |  |
| `submitted_at` | `timestamptz` |  Nullable |
| `score` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

