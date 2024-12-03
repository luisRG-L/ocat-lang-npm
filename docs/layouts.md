# Layouts

Layouts are used to group components together.

## Syntax

```ocat
layout [
    -code-
]
```

Use ```layout``` to define a layout.

### Params

- code: The code to use.

### Special orders

- `{*children*}`: The children of the layout.
- `{*description*}`: The description of the page.
- `{*title*}`: The title of the page.

## Example

```ocat
layout [
    <h1>{*title*}</h1>
    {*children*}
]

title "Hello world!"

[
    <h2>Hello world 2!</h2>
] as ''
```

## Notes

> [!IMPORTANT]
> Use the space character between the tokens.
