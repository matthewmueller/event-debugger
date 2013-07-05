
# event-debugger

  step through events! must be initialized at the top of your scripts.

  ![event debugger](http://i.cloudup.com/ch5RHQwJq0.png)

## Installation

    $ component install matthewmueller/event-debugger

## Example

```js
var ed = require('event-debugger');
ed('click');

$('li').click(function() {
  console.log('li');
});

$('body').click(function() {
  console.log('body');
});
```

## API

### `EventDebugger(type)`

Initialize the event debugger with a given `type`. `type` supports both strings and regex.

```js
ed(/^(mouseover|mousedown)$/)
```

## License

  MIT
