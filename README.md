# Jiggly.js #

By Kyle Machulis <kyle@nonpolynomial.com>

Twitter: [@qdot](http://www.twitter.com/qdot)

[http://www.nonpolynomial.com](http://www.nonpolynomial.com)

## Description ##

Jiggly.js is a javascript library all about making things jiggly.
However, most times you'd think that'd mean making DOM elements
jiggly.

I'm talking about physical vibration. This library has the hopes of
being the first javascript library you'll want to rub yourself against
(and will also actually be able to. Don't think I don't know how you
fantasize about JS libraries.).

There's already the
[The Web Vibration API](http://www.w3.org/TR/vibration/), but it only
allows you to turn vibration on and off for certain periods of time.
While that's useful for notifications in mobile apps, it's not real
fun for other sorts of expressive haptics. Jiggly.js provides a rather
janky, processing heavy, half working method to give you vibration
levels between just off and on.

Not only that, there's more out there than just cell phone vibration.
There are certain vibrating products like the
[OhMiBod](http://www.ohmibod.com) that react to audio to set vibration
speeds. Between HTML5 and WebAudio, we should be able to let most
major browsers output sound that can control these toys.

Finally, someday we might have access to USB and Bluetooth vibrators
via the WebUSB and WebBluetooth APIs. So we're futureproofing for
that. Yup.

The core idea of Jiggly.js is to abstract away the methods by which we
trigger vibrations, and provide a common API for all of these systems
for setting speed and relaying patterns. After configuring output
methods, all API calls to Jiggly.js should look and react similarly.

## Requirements ##

First off, you're going to need something to vibrate. This requires:

- A Web Browser (see below for browser requirements)
- OPTIONAL - An Android phone running ICS (for WebVibration)
- OPTIONAL - A audio activated vibrator like the
  [OhMiBod](http://ohmibod.com) (for Audio Vibration)

If you have both, then lucky you! You can actually run both at once.
If you have neither of the optional, then, uh, enjoy listening to sine
waves? Maybe you're into that sort of thing? (I totally am. My Raster
Noton collection totally confirms it.)

## Browser Support ##

### WebVibration Core ###

On Desktop:

  - Not happening in anything unless you write your own HAL access.
    Makes one think that most people don't have vibrators on the
    desktop computers. Why on earth would they miss out?

On Mobile:

  - Firefox Mobile: Works!
  - Android Browser: Nope
  - Chrome for Android: Nope
  - Safari: HAHAHAHAHAHAHA Nope and probably never will
  - Opera: Not tested
  - Windows Phone: Not tested

### HTML5Audio Core ###

Using [Howler.js](https://github.com/goldfire/howler.js) for our audio
core since it supports both HTML5 and WebAudio.

On Desktop:

  - Chrome: Works!
  - Firefox: Audio looping through Firefox seems to be glitchy on both
    OS X and linux, aurora and nightly. May still work, but not perfect.
  - IE: Not tested

On Mobile:

  - Firefox Mobile: No luck in beta. Nightly works in a rather
    janktastic way. Lots of glitching on audio loops.
  - Android Browser: Sometimes works? Cuts out a lot.
  - Chrome for Android: Sound for a second, then nothing.
  - Safari: Not tested
  - Opera: Not tested
  - windows Phone: Not tested

## Using the Jiggly.js API ##

Jiggly.js only has three usable calls:

- Jiggly.setOutputMode(mode) - Sets the whether we should use
  WebVibration, Audio, both, neither, etc...
- Jiggly.runSpeed(power, cycle duration (optional)) - Run at a certain
  power level until called again. For WebVibration, you can also set
  the cycle duration. Read examples and "how it works" for explanation
  of cycles.
- Jiggly.runPattern([[power, time, cycle duration], ...]) - Similar to
  how WebVibration works, except now with power AND time as part of
  the pattern instead of just on/off. Cycle duration can be set per
  pattern element.
  
### Examples ###

```javascript
Jiggly.setOutputMode(Jiggly.outputMethods.WEBVIBRATION);
Jiggly.runSpeed(80, 100);
```

This uses the webvibration output method, with a cycle duration of
100ms, and a duty cycle of 80%. So, 80ms on, 20ms off.

For audio, things look mostly the same.

```javascript
Jiggly.setOutputMode(Jiggly.HTML5AUDIO);
Jiggly.runSpeed(80);
```

Same as before, except our duty cycle here isn't specifically a duty
cycle (see explanation later if you care, otherwise trust me it
works). We also don't need a duration because aforementioned reasons
about later mentioned reasons. The first argument is still considered
to be "percentage power", though.

Finally, you can use both by AND'ing the flags.

```javascript
Jiggly.setOutputMode(Jiggly.outputMethods.WEBVIBRATION | Jiggly.outputMethods.HTML5AUDIO);
Jiggly.runSpeed(80, 100);
```

For patterns:

```javascript
Jiggly.setOutputMode(Jiggly.outputMethods.WEBVIBRATION | Jiggly.outputMethods.HTML5AUDIO);
Jiggly.runPattern([80, 100, 50], [10, 50, 100], [0, 0, 0]);
```

This runs a pattern of:

- 80% power, for 100ms, with a 50ms cycle duration, then
- 10% power, for 50ms, with a 100ms cycle duration, then
- Turning things off, basically.

The Jiggly.js API will most likely expand/change if/when/as I give a
shit.

## Power Level Caveats ##

For anyone asking "But that means I can only get 100 steps of power!":

Yes. This is a totally unproven and very jank ass way of triggering
vibration through a system not made to give you the guarantees you'd
need in timing for more steps than that.

If you're working with WebVibration, your cycle durations probably
won't be higher than 50ms anyways, and since we only have millisecond
fidelity, we don't even *HAVE* 100 steps. So shut up and enjoy what
you get.

And yes I realize WebAudio and the HTML5 audio core give you far more
fidelity but really read the last sentence of the last paragraph
again.

## How Jiggly.js Works ##

This section covers the basic theory behind the different output modes
for Jiggly.js. This knowledge is not required to use the library, it's
mostly here because I like explaining things.

### Janking The WebVibration API ###

First off, we'll describe how we set speeds via the WebVibration API,
which is the output method that's going to be available to most users.

A quick refresher in the WebVibration API for those not familiar. It's
quite simple:

```javascript
navigator.vibrate([200, 100, 1000, 100]);
```

Vibrate is the only function exposed by the WebVibration API. It takes
either an int, or an array of ints, representing milliseconds. For the
above line, we turn the vibrator on for 200 milliseconds, then off for
100ms, on for 1 second, off for 100, then just off forever.

This is great if you want to give someone a quick buzz or two to let
them know they got an email/phone call, touched the screen, etc...
However, for other uses of vibrators, it's not going to do you a lot
of good.

So how can we set varying speeds with an API that only allows us to
turn a motor on and off? Answering this requires a bit of background
in how digitally controlled motors work.

What we're going to do is create our own Pulse Width Modulation (PWM).
PWM is a way of setting the speed of a motor by turning its power
source on and off very, very quickly (technically known as "setting
and varying the duty cycle"). If you want a motor to run at 70% duty
cycle (so 70% of its full capacity for a non-existantly perfect motor
but shut up this is an example), you turn the power on for 70% of a
certain duration, off for 30%. So let's say our duration is 1
second. We'd have power on for 700ms, off for 300ms. Easy, right?

Except for the fact that durations on microcontrollers are usually in
the milliseconds range if not less. The maximum resolution we can get
with WebVibration is _technically_ 1 millisecond, but this is not at
all a real time guarantee. We also have to factor in the javascript
scheduler, the communications with the IO thread that is talking to
the hardware in the browser core, and so on. So all we're guaranteed
is that, at some point after 1ms, things will change.

Shit.

This fact doesn't really end our hopes, just lessens them slightly.
This is due to the fact that we're running a motor with a load
attached to it. Since there's a weight attached to the motor (which is
what makes it vibrate since it's spinning and constantly moving the
center of gravity), it takes multiple milliseconds to spin up, and
multiple milliseconds to spin down again. That means that we've got
enough time in javascript to turn off power before the motor gets
going at full speed, then turn it back on before it stops. The
vibration that happens via these means may not be smooth, but we will
at least get some approximation of speeds, and possibly some
interesting textures.

### Audio Vibrator Control ###

This is where the discussion of how audio vibration works goes once I
have time to write it. For now, just know it's a volume controller and
that's it. It really is that simple.
