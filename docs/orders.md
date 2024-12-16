# Orders

Orders are used to define the order of the code.

## Syntax

```ocat
@-order name- ( -params- )
```

Use ```@``` to define an order.

### Params

- order name: The name of the order.
- params: The params of the order.

## Orders

- strict: Use strict mode.
- mode ( 'dev' | 'common' ): The mode of the code.

## Example

```ocat
@strict

mode 'dev'
```

## Notes

> [!IMPORTANT]
> Use the space character between the tokens.
