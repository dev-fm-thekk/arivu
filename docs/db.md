## Table `questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `question` | `text` |  |
| `options` | `jsonb` |  |
| `tags` | `_text` |  |
| `contributer` | `uuid` |  |
| `category_id` | `int8` |  |
| `answer` | `text` |  |

## Table `user`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Nullable |
| `email` | `text` |  Nullable |

## Table `tests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `time_limit` | `int4` |  |
| `total_attempts` | `int4` |  |
| `title` | `text` |  |
| `created_by` | `uuid` |  Nullable |

## Table `attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `userId` | `uuid` |  |
| `score` | `numeric` |  |
| `started_at` | `timestamptz` |  |
| `test_id` | `int8` |  |
| `submitted_at` | `timestamptz` |  Nullable |

## Table `AptitudeCategories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `slug` | `text` |  Unique |
| `name` | `text` |  Nullable |

## Table `test_questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `test_id` | `int8` | Primary |
| `question_id` | `int8` | Primary |
| `order_index` | `int4` |  Nullable |

## Table `test_attempt_questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `attempt_id` | `int8` | Primary |
| `question_id` | `int8` | Primary |
| `selected_answer` | `text` |  Nullable |
| `is_correct` | `bool` |  Nullable |

