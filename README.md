# Supabase Fundraiser Widget

A simple, embeddable JavaScript widget that displays fundraiser data from Supabase.

## Quick Start

1. **Add a container** to your HTML where the widget should appear:
```html
<div id="jewgo-widget"></div>
```

2. **Configure** the widget by setting global variables:
```html
<script>
  window.WIDGET_SUPABASE_URL = 'https://your-project.supabase.co';
  window.WIDGET_SUPABASE_KEY = 'your-anon-public-key';
  window.WIDGET_FUNDRAISER_ID = '123';
</script>
```

3. **Load** the widget script:
```html
<script src="widget.js"></script>
```

## Configuration Options

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WIDGET_SUPABASE_URL` | Yes | - | Your Supabase project URL |
| `WIDGET_SUPABASE_KEY` | Yes | - | Your Supabase anon/public API key |
| `WIDGET_FUNDRAISER_ID` | Yes | - | The ID of the fundraiser to display |
| `WIDGET_CONTAINER_ID` | No | `'jewgo-widget'` | ID of the HTML element to render into |

## Database Schema

The widget expects a `fundraisers` table with these columns:
- `id` - Fundraiser ID (used to query)
- `title` - Fundraiser title
- `description` - Optional description
- `goal_amount` - Target amount to raise
- `amount_raised` - Current amount raised

## Programmatic API

After loading, the widget exposes a global object:

```javascript
// Reload the widget data
window.JewgoWidget.reload();
```

## Security Notes

- Use your **anon/public key**, not the service role key
- Enable Row Level Security (RLS) on your Supabase table
- Create a policy to allow public reads for the `fundraisers` table

## Example

See `example.html` for a complete working example.
