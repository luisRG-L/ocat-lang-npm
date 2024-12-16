# Page Request

A page request is a html, css or js code that can be used in `Orange Cat`

## Syntax

```ocat
[
    -your HTML, CSS or JS code-
] as -route(without / at the beginning)-
```

Use `[` to open and `]` to close the page request.
Use `as` to define the route.

### Params

- your HTML, CSS or JS code: The code to be used in the page request.
- route: The route of the page request.

## Example

```ocat
[
    <h1>Hello world!</h1>
] as ''
```

## Notes

> [!IMPORTANT]
> Use the space character between the tokens.
