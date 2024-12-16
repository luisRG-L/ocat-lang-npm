# Page Styling

You can stylize your pages using `Css`.

## Syntax

```ocat
[
%css-global%
-your-css-code-
]
```

Use `[` to open and `]` to close the page styling.
Use `%css-global%` to define that this page-request is a styling page.

## Params

- your-css-code: The code to be used in the page styling.

## Example

```ocat
[
%css-global%

body {
    background-color: red;
}

h1 {
    color: white;
}
]

[
    <h1>Hello world!</h1>
] as ''
```

## Notes

> [!IMPORTANT]
> Use the space character between the tokens.
***
> [!IMPORTANT]
> Don't use the 'as' keyword in the styling page.
