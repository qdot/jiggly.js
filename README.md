# Jiggly.js #

By Kyle Machulis <kyle@nonpolynomial.com>

[http://www.nonpolynomial.com](http://www.nonpolynomial.com)

## Description ##

Jiggly.js is a javascript library all about making things jiggly.
However, most times you'd think that'd mean making DOM elements
jiggly.

However, we're talking physical vibration here. This library has the
hopes of being the first javascript library you'll want to rub
yourself against.

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

## Using the Jiggly.js API ##

Jiggly.js currently only has three calls available:

```javascript
Jiggly.setOutputMode(Jiggly.WEBVIBRATE);
Jiggly.setDuration(100);
Jiggly.runPattern([(100, 20), (200, 50)]);
```

Looks pretty much like WebVibration, right? The difference is, instead
of striding the array with On/Off times, it's now (Time, Duty Cycle).
We'll run for 100ms at 20% duty cycle, then 200ms at 50% duty cycle.

If we want to get REALLY crazy, we can even vary our duration:

```javascript
Jiggly.setOutputMode(Jiggly.WEBVIBRATE);
Jiggly.runPattern([(100, 20, 50), (200, 50, 80)]);
```

Now we'd run for 100ms at 20% duty cycle on a 50ms duration (10ms on,
40ms off), then 200ms at 50% duty cycle on a 80ms duration (40ms on,
40ms off).

For audio, things look mostly the same.

```javascript
Jiggly.setOutputMode(Jiggly.WEBAUDIO); // Can also be Jiggly.HTML5AUDIO
Jiggly.vibrate([(100, 20), (200, 50)]);
```

Same as before, except our duty cycle here isn't specifically duty
cycle. It is still considered to be "percentage power", though.

Finally, you can just set a speed to run until another speed is sent.

```javascript
// runSpeed(duty percentage, duration (optional))
Jiggly.runSpeed(50, 25);
```

For anyone asking "But that means I can only get 100 steps of power!":

Yes. This is a totally unproven and probably broken way of triggering
vibration through a system not made to give you the guarantees you'd
need in timing for more steps than that. So shut up and enjoy it.

And yes I realize WebAudio give you far more fidelity but really read
the last sentence of the last paragraph again.

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

Now we get into physics. 

### Audio Vibrator Control ###

This is where the discussion of how audio vibration works goes.
