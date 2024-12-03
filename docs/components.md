# Components

## Syntax

```ocat
component -name- [
    -HTML code-
]
```

Use ```component``` to define a component.

### Params

- html code: The HTML code for display at using the component.
- name: The name that you want to use for using the component.

## Component usage

### Syntax

```ocat
[
    <{-component-name-}>
] as ''
```

### Params

- component name: The name of the component that you called in the component definition.

## Example

```ocat
component hello [
    <h1>Hello world!</h1>
]

[
    <{hello}>
] as ''
```

## Notes

> [!IMPORTANT]
> Use the space character between the tokens.
