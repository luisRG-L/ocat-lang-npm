# Examples

## Basic program 'Hello World'

> [!TIP]
> Avoid using the '%' in print statements.

```ocat
print ( "Hello World!" )
```

## Basic webpage

This program creates a basic webpage with a 'H1' title and two paragraphs.

> [!NOTE]
> Don't use `<html>` or `<body>` tags in your program.

```ocat
[
<h1>Hello World</h1>
<p>This is a basic webpage</p>
<p>This is a paragraph</p>
] as ''
```

## Basic webpage with CSS

This program creates a basic webpage with a 'H1' title and two paragraphs. The webpage is styled with CSS.

> [!TIP]
> Use the route 'style' to write your CSS.

```ocat
[
%css-global%
p {
    color: red;
    font-size: 20px;
}
h1 {
    color: blue;
    font-size: 30px;
}
]

[
<h1>Hello World</h1>
<p>This is a basic webpage</p>
<p>This is a paragraph</p>
] as ''
```

## Basic webpage with CSS and JavaScript

This program creates a basic webpage with a 'H1' title and two paragraphs. The webpage is styled with CSS and JavaScript.

> [!TIP]
> Use the route 'script' to write your JavaScript.

```ocat
[
%css-global%
p {
    color: red;
    font-size: 20px;
}
h1 {
    color: blue;
    font-size: 30px;
}
]

[
function changeColor() {
    document.body.style.backgroundColor = "#00FF00";
}
] as 'script'

[
< src="./script" />
<h1 onclick="changeColor()">Hello World</h1>
<p>This is a basic webpage</p>
<p>This is a paragraph</p>
] as ''
```

## Routed webpage
