# Functions

Functions are used to group code together.

## Syntax

```ocat
func -name- ( ) {
    -code-
}
```

Use ```func``` to define a function.

### Params

- name: The name of the function.
- code: The code to be executed when the function is called.

## Function Calls

### Syntax

```ocat
call -name-
```

Use ```call``` to call a function.

## Example

```ocat
func hello () {
    print ( "Hello world!" )
}

call hello
```

## Notes

> [!IMPORTANT]
> Use the space character between the tokens.
