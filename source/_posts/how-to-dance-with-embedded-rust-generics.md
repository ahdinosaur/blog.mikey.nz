---
title: How to dance with embedded Rust generics
date: 2023-04-05 14:15:54
tags:
---

As part of [my work](https://villagekit.com) on [Grid Bot "Tahi"](https://github.com/villagekit/gridbot-tahi), I _finally_ figured out how to make [the code for my robot re-usable as a library](https://github.com/villagekit/robokit). Since to do this I needed to go on a deep journey into understanding Rust types, I thought I might share my learnings.

## The embedded Rust world

Before we begin, here's a quick recap of [the embedded Rust world](https://github.com/rust-embedded/awesome-embedded-rust):

- Rust can compile to any `target` supported by LLVM, so most everything.
- You can tell Rust to be in "`#[no_std]`" mode and your code will not load the standard library (`std`)  or data structures that depend on heap allocations (`alloc`).
  - To use data structures that depend on heap allocations (`alloc`), you can then BYO (bring your own) allocator, such as [`embedded-alloc`](https://github.com/rust-embedded/embedded-alloc).
- Each processor architecture usually has a Rust module for low-level access to the processor
  - For example: [`cortex-m`](https://github.com/rust-embedded/cortex-m) for ARM processors, [`riscv`](https://github.com/rust-embedded/riscv) for RISC-V processors, etc.
  - Note: most embedded chips use an ARM processor
- Each chip family has a "Peripheral Access Crate" for low level control of registers
  - Hardware manufacturers provide an SVD file (System View Description), which define how the hardware's (magic) memory addresses are mapped to peripheral registers, [`svd2rust`](https://github.com/rust-embedded/svd2rust) converts these to a type-safe Rust interface, so you can only use the registers in a safe way.
  - For example, the [`stm32-rs`](https://github.com/stm32-rs/stm32-rs) for STM32 microcontrollers, [`nrf-pacs`](https://github.com/nrf-rs/nrf-pacs) for nRF microcontrollers
- Each chip family then also has a "Hardware Abstraction Layer" for higher level control of peripherals
  - To provide a foundation for building device-agnostic hardware drivers, [`embedded-hal`](https://github.com/rust-embedded/embedded-hal) provides [Traits](https://doc.rust-lang.org/book/ch10-02-traits.html) (abstract interfaces) for (most) hardware abstractions.
  - Each each device has their own `xxx-hal` which provides the specific hardware implementations for these abstract interfaces.
  - For example, I'm using a [Nucleo-F767ZI](https://nz.element14.com/stmicroelectronics/nucleo-f767zi/dev-board-nucleo-32-mcu/dp/2546569), which is supported by [`stm32f7xx-hal`](https://github.com/stm32-rs/stm32f7xx-hal).
  - Another example is the `ESP32-C3` supported by [`es32c3-hal`](https://github.com/esp-rs/esp-hal/tree/main/esp32c3-hal#getting-started)

(For an in-depth adventure into porting Rust to a chip, see [Rust on the CH32V003](https://noxim.xyz/blog/rust-ch32v003/))

In our quest, we will be building something device-agnostic using the generic HAL (Hardware Abstraction Layer) traits. We won't need to worry much about the lower level details, things just work.

## A device-agnostic `Led` interface

So let's say we want to create a device-agnostic (non-blocking) interface for an LED connected to your micro-controller. Here's how we might do this:

```rust
use core::{fmt::Debug, task::Poll};
use embedded_hal::digital::v2::{OutputPin, PinState};

#[derive(Copy, Clone, Debug)]
pub enum LedAction {
    Set { is_on: bool },
}

#[derive(Copy, Clone, Debug)]
pub enum LedError<PinError: Debug> {
    PinSet(PinError),
}

pub struct Led<P>
where
    P: OutputPin,
{
    pin: P,
    is_on: bool,
}

impl<P> Led<P>
where
    P: OutputPin,
    P::Error: Debug,
{
    pub fn new(pin: P) -> Self {
        Self { pin, is_on: false }
    }

    pub fn run(&mut self, action: &LedAction) {
        match action {
            LedAction::Set { is_on } => self.is_on = *is_on,
        }
    }

    pub fn poll(&mut self) -> Poll<Result<(), LedError<P::Error>>> {
        self.pin
            .set_state(PinState::from(self.is_on))
            .map_err(LedError::PinSet)?;

        Poll::Ready(Ok(()))
    }
}
```

For a simple example there's a lot happening, especially if you are new to Rust!

- `LedAction` is an enum we will use to tell the LED how to update.
- `LedError` is an object we will use to represent any error.
  - This receives one generic type, `PinError` (which implements the `Debug` trait), since we don't know the specific type of error a hardware pin might return.
  - This also uses the `#[derive(...)]` macro to automatically derive the traits `Copy`, `Clone`, and `Debug`. Note: We can only derive these traits if all the types within this object also implement the trait. This is why we must explicitly say that `PinError` must implement the `Debug` trait.
- `Led` is a struct we will use as our LED abstraction, like a class in other languages.
  - For the methods,
    - The `new` method is our constructor for creating a new LED.
    - The `run` method receives our action telling the LED how to update, and update our LED abstraction's internal state (but not yet updating the external hardware).
      - This method returns nothing (which is by default the empty tuple `()`).
    - The `poll` method will update the external hardware as needed to match the internal state.
      - This method returns a `Poll` (which can be either `Pending` or `Ready(value)`) of a `Result` (which can be either `Ok(value)` or `Err(error)`) of either a empty value `()` or an error `P::Error` (the associated type `Error`, attached to the `OutputPin` trait).
    - For the types, this receives one generic type `P`, which implements `OutputPin` (provided by the `embedded-hal` library). We also specify that `P::Error` (the associated type `Error`, attached to the `OutputPin` trait) implements `Debug`.

### An dummy `GpioA` struct to `impl OutputPin`

Now if you're curious, here's what a dummy struct that implements the `OutputPin` trait would look like.

```rust
use embedded_hal::digital::v2::{OutputPin, PinState};

pub struct GpioA {
    state: PinState,
}

#[derive(Copy, Clone, Debug)]
pub struct GpioAError {}

impl GpioA {
    pub fn new() -> Self {
        Self {
            state: PinState::Low,
        }
    }
}

impl OutputPin for GpioA {
    type Error = GpioAError;

    fn set_low(&mut self) -> Result<(), Self::Error> {
        self.state = PinState::Low;
        Ok(())
    }
    fn set_high(&mut self) -> Result<(), Self::Error> {
        self.state = PinState::High;
        Ok(())
    }
    fn set_state(&mut self, state: PinState) -> Result<(), Self::Error> {
        self.state = state;
        Ok(())
    }
}
```

Note: This won't do anything!

In the real-world, these structs affect registers on the hardware and are provided by your device's `xxx-hal` library, almost certainly generated with a macro.

### A more detailed `Led` using a timer

If you're wondering why there's a difference between `run` and `poll`, let's change our LED abstraction so we can also tell an LED to blink for a specific amount of time. Since we can't do a blocking `sleep`, you'll see why `poll` is designed to be non-blocking.

```rust
use core::fmt::Debug;
use core::task::Poll;
use embedded_hal::digital::v2::{OutputPin, PinState};
use fugit::TimerDurationU32 as TimerDuration;
use fugit_timer::Timer;
use nb;

#[derive(Clone, Copy, Debug)]
pub enum LedAction<const TIMER_HZ: u32> {
    Set { is_on: bool },
    Blink { duration: TimerDuration<TIMER_HZ> },
}

#[derive(Clone, Copy, Debug, Format)]
pub enum LedBlinkStatus {
    Start,
    Wait,
    Done,
}

#[derive(Clone, Copy, Debug)]
pub enum LedState<const TIMER_HZ: u32> {
    Set {
        is_on: bool,
    },
    Blink {
        status: LedBlinkStatus,
        duration: TimerDuration<TIMER_HZ>,
    },
}

#[derive(Clone, Copy, Debug)]
pub struct Led<P, T, const TIMER_HZ: u32>
where
    P: OutputPin,
    T: Timer<TIMER_HZ>,
{
    pin: P,
    timer: T,
    state: Option<LedState<TIMER_HZ>>,
}

#[derive(Clone, Copy, Debug)]
pub enum LedError<PinError: Debug, TimerError: Debug> {
    PinSet(PinError),
    TimerStart(TimerError),
    TimerWait(TimerError),
}

impl<P, T, const TIMER_HZ: u32> Led<P, T, TIMER_HZ>
where
    P: OutputPin,
    P::Error: Debug,
    T: Timer<TIMER_HZ>,
    T::Error: Debug,
{
    pub fn new(pin: P, timer: T) -> Self {
        Self {
            pin,
            timer,
            state: None,
        }
    }

    fn run(&mut self, action: &LedAction) {
        match action {
            LedAction::Set { is_on } => {
                self.state = Some(LedState::Set { is_on: *is_on });
            }
            LedAction::Blink { duration } => {
                self.state = Some(LedState::Blink {
                    status: LedBlinkStatus::Start,
                    duration: *duration,
                });
            }
        }
    }

    fn poll(&mut self) -> Poll<Result<(), LedError<P::Error, T::Error>> {
        match self.state {
            None => Poll::Ready(Ok(())),
            Some(LedState::Set { is_on }) => {
                // set led state
                self.pin
                    .set_state(PinState::from(is_on))
                    .map_err(LedError::PinSet)?;

                self.state = None;

                Poll::Ready(Ok(()))
            }
            Some(LedState::Blink { duration, status }) => {
                match status {
                    LedBlinkStatus::Start => {
                        // start timer
                        self.timer.start(duration).map_err(LedError::TimerStart)?;

                        // turn led on
                        self.pin.set_high().map_err(LedError::PinSet)?;

                        // update state
                        self.state = Some(LedState::Blink {
                            status: LedBlinkStatus::Wait,
                            duration,
                        });

                        Poll::Pending
                    }
                    LedBlinkStatus::Wait => match self.timer.wait() {
                        Err(nb::Error::Other(err)) => Poll::Ready(Err(LedError::TimerWait(err))),
                        Err(nb::Error::WouldBlock) => Poll::Pending,
                        Ok(()) => {
                            self.state = Some(LedState::Blink {
                                status: LedBlinkStatus::Done,
                                duration,
                            });

                            Poll::Pending
                        }
                    },
                    LedBlinkStatus::Done => {
                        self.pin.set_low().map_err(LedError::PinSet)?;

                        self.state = None;

                        Poll::Ready(Ok(()))
                    }
                }
            }
        }
    }
}
```


Oh gosh that's a mouthful!

In `Led`, we're using a state machine:

- An `LedBlinkStatus` is either `Start`, `Wait`, or `Done`.
- The current `LedBlinkState` state is stored in `self.state`
- The `run` method updates the state with the given duration and a current status of `Start`.
- On poll,
  - If the current state is empty, we're done and we return (send a message to whoever polled us) that we're ready (done).
  - If the current status is `Start`, we turn the LED on, start the timer, and set the status to `Wait`. We return that we're still waiting (pending).
  - If the current status is `Wait`, we check the timer. If it's done, we set the status to `Done`. If the timer is not done ("would block"), then we do nothing. In either case, we return that we're still waiting (pending).
  - If the curent status is `Done`, we turn the LED off, we reset the state to empty, and we return that we're ready (done).
  - In any of these cases, if we get an error, we send the error upwards (as part of saying we're done).

In `Led`, we're using a state machine:

- `LedState` is an enum with either:
  - `Set` with a boolean `is_on`
  - `Blink` with a `status` (`LedBlinkStatus`) and a `duration`
- `LedBlinkStatus` is either `Start`, `Wait`, or `Done`.
- The current `LedState` is stored in `self.state`.
- The `run` method takes an `LedAction` and updates the state accordingly.
- On `poll`,
  - If the current state is `None`, we're done and we return (send a message to whoever polled us) that we're done (`Poll::Ready(Ok(()))`)
  - If the current state is `Some(LedState::Set {})`, we set the LED to the desired on/off state. Then, we reset the state to `None` and return that we're done (`Poll::Ready(Ok(()))`).
  - If the current state is `Some(LedState::Blink {})`, the method handles the blinking action based on the current `LedBlinkStatus`:
    - If the status is `Start`, it turns the LED on, starts the timer with the given duration, updates the status to `Wait`, and returns `Poll::Pending`, indicating it's still waiting.
    - If the status is `Wait`, it checks the timer:
      - If the timer returns an error, it returns `Poll::Ready(Err(LedError::TimerWait(err)))`, propagating the error.
      - If the timer is not done and returns "would block", it returns `Poll::Pending`, indicating it's still waiting.
      - If the timer is done, it updates the status to `Done` and returns `Poll::Pending`.
    - If the status is `Done`, it turns the LED off, resets the state to `None`, and returns `Poll::Ready(Ok(()))`, indicating it's done.
  - In any of the steps mentioned above, if we get an erro, we send the error upwards `return Poll::Ready(Err(LedError))`.

I hope that makes some sense.

For the rest of the post, I'll be assuming the original, simpler `Led` struct.

## A `Runner` to control multiple `Led`

Now say we want to control multiple LEDs together.

We will create a `Runner` that can receive a command, delegate that command to the associated actuator, and poll all active commands until completion.

To start, we know there will be three LEDs: a green LED, a blue LED, and a red LED.

```rust
use alloc::collections::VecDeque;
use core::fmt::Debug;
use core::task::Poll;

#[derive(Copy, Clone, Debug)]
pub enum Command {
    GreenLed(LedAction),
    BlueLed(LedAction),
    RedLed(LedAction),
}

pub enum CommandError<GreenLedError: Debug, BlueLedError: Debug, RedLedError: Debug> {
    GreenLedError(GreenLedError),
    BlueLedError(BlueLedError),
    RedLedError(RedLedError),
}

pub struct Runner<GreenPin, BluePin, RedPin>
where
    GreenPin: OutputPin,
    BluePin: OutputPin,
    RedPin: OutputPin,
{
    active_commands: VecDeque<Command>,
    green_led: Led<GreenPin>,
    blue_led: Led<BluePin>,
    red_led: Led<RedPin>,
}

impl<GreenPin, BluePin, RedPin> Runner<GreenPin, BluePin, RedPin>
where
    GreenPin: OutputPin,
    GreenPin::Error: Debug,
    BluePin: OutputPin,
    BluePin::Error: Debug,
    RedPin: OutputPin,
    RedPin::Error: Debug,
{
    pub fn new(green_led: GreenLed, blue_led: BlueLed, red_led: RedLed) -> Self {
        Self {
            active_commands: VecDeque::new(),
            green_led,
            blue_led,
            red_led,
        }
    }

    pub fn run(&mut self, command: Command) {
        match command {
            Command::GreenLed(action) => self.green_led.run(&action),
            Command::BlueLed(action) => self.blue_led.run(&action),
            Command::RedLed(action) => self.red_led.run(&action),
        }
        self.active_commands.push_back(command);
    }

    pub fn poll(
        &mut self,
    ) -> Poll<Result<(), CommandError<GreenPin::Error, BluePin::Error, RedPin::Error>>> {
        let num_commands = self.active_commands.len();
        for _command_index in 0..num_commands {
            let command = self.active_commands.pop_front().unwrap();
            let result = match command {
                Command::GreenLed(_) => self
                    .green_led
                    .poll()
                    .map_err(|err| CommandError::GreenLedError(err)),
                Command::BlueLed(_) => self
                    .blue_led
                    .poll()
                    .map_err(|err| CommandError::BlueLedError(err)),
                Command::RedLed(_) => self
                    .red_led
                    .poll()
                    .map_err(|err| CommandError::RedLedError(err)),
            };

            match result {
                Poll::Ready(Ok(())) => {}
                Poll::Ready(Err(err)) => {
                    self.active_commands.push_back(command);

                    return Poll::Ready(Err(err.into()));
                }
                Poll::Pending => {
                    self.active_commands.push_back(command);
                }
            }
        }

        if self.active_commands.len() == 0 {
            Poll::Ready(Ok(()))
        } else {
            Poll::Pending
        }
    }
}
```

Woah, okay!

- `Command` is an enum to represents any action we might want to send to any LED.
- `CommandError` is an enum to represent any error that might happen with any LED.
- `Runner` is the struct to manage our three LEDs (green, blue, and red).
  - We store a list of active commands (`active_commands`) and an `Led` object for each color.
  - For the methods:
    - `new`: Creates a new `Runner` object, taking green, blue, and red LEDs as inputs.
    - `run`: Takes a `Command` as input, performs the action for the specified LED color, and adds the command to the list of active commands.
    - `poll`: Checks the progress of each command in the list:
      - If a command is done, it removes the command from the list.
      - If a command is not done, it keeps the command in the list.
      - If there's an error, it returns the error and puts the command back in the list.

In a nutshell, this code manages a set of LEDs, allowing you to turn them on or off by adding commands to a list, and it checks the progress of these commands. If you run into any issues, it will handle the errors for each LED color.

## The crux of the problem

Now here's the point where I can finally explain why I had such a hard time to make the code for my robot re-usable as a library.

If you want to use my `Runner` as written above, sure the use of generic types meant you can use any device, use any pin that implements `embedded_hal`'s `OutputPin`. But you better have only 3 LEDs, and you better want them to be named "Green", "Blue", and "Red".

Generic types were helpful to be device-agnostic, but at the same time didn't help us be shape-agnostic.

The rest of the post will share step-by-step how I achieved a system where the shape was not pre-defined.

### Generic type hell

So let's go back to `Runner`'s generic types: `GreenPin`, `BluePin`, and `RedPin`.

```rust
pub struct Runner<GreenPin, BluePin, RedPin>
where
  GreenPin: OutputPin,
  BluePin: OutputPin,
  RedPin: OutputPin,
{
    active_commands: VecDeque<Command>,
    green_led: Led<GreenPin>,
    blue_led: Led<BluePin>,
    red_led: Led<RedPin>,
}
```

Now, this looks okay (when you've become accustomed to generic types), but this is only considering our original `Led` struct that only needs a `P: OutputPin`. In our later `Led` struct, we need two more generics: `T: Timer<HZ>` and `const HZ: u32`.

Imagine we needed more:

```rust
pub struct Runner<
    GreenLedPin,
    GreenLedTimer,
    const GREEN_LED_TIMER_HZ: u32,
    BlueLedPin,
    BlueLedTimer,
    const BLUE_LED_TIMER_HZ: u32,
    RedLedPin,
    RedLedTimer,
    const RED_LED_TIMER_HZ: u32,
    XAxisStepperDriver,
    XAxisTimer,
    const X_AXIS_TIMER_HZ: u32,
    YAxisStepperDriver,
    YAxisTimer,
    const Y_AXIS_TIMER_HZ: u32,
    MainSpindleDriver,
    >
where
    GreenLedPin: OutputPin,
    GreenLedTimer: Timer<GREEN_LED_TIMER_HZ>,
    BlueLedPin: OutputPin,
    BlueLedTimer: Timer<BLUE_LED_TIMER_HZ>,
    RedLedPin: OutputPin,
    RedLedTimer: Timer<RED_LED_TIMER_HZ>,
    XAxisStepperDriver: SetDirection + Step,
    XAxisTimer: Timer<X_AXIS_TIMER_HZ>,
    YAxisStepperDriver: SetDirection + Step,
    YAxisTimer: Timer<Y_AXIS_TIMER_HZ>,
    MainSpindleDriver: SpindleDriver

{
    pub green_led: Led<GreenLedPin, GreenLedTimer, TICK_TIMER_HZ>,
    pub blue_led: Led<BlueLedPin, BlueLedTimer, TICK_TIMER_HZ>,
    pub red_led: Led<RedLedPin, RedLedTimer, TICK_TIMER_HZ>,
    pub x_axis: Axis<AxisMotionControl<XAxisDriver, XAxisTimer, X_AXIS_TIMER_HZ>>,
    pub y_axis: Axis<AxisMotionControl<YAxisDriver, YAxisTimer, Y_AXIS_TIMER_HZ>>,
    pub main_spindle: Spindle<MainSpindleDriver>,
}
```

Yuck.

The problem with these generic types is that anything that consumes a struct also need to provide their generic types. This becomes a sort of "generic hell", where we can't escape generic types just bubbling up to the consumer's code and beyond.

The solution to generic type hell is traits.

So let's go!

## Traits to the rescue

Beyond the generic type hell problem, we want our system to support multiple types of hardware interfaces that affect the real world.

### `trait Actuator`

We create an `Actuator` trait to generalize our use of hardware interfaces (while still being device agnostic).

```rust
use core::task::Poll;

pub trait Actuator {
    type Action;
    type Error: Debug;

    fn run(&mut self, action: &Self::Action);
    fn poll(&mut self) -> Poll<Result<(), Self::Error>>;
}
```

As an aside, a Rust expert might say that `run` should return a `Future`, which we can `poll`. I chose this design because such a future would need a mutable reference to the hardware peripherals (and Rust has strict rules about object ownership, references, and mutability) and at the time I wanted to avoid using allocations (`Rc`). If this is an achievable change for my current code base, I'd love to learn how, every day is a school day.

### `impl Actuator for Led`

Now to update `Led`:

```rust
use core::{fmt::Debug, task::Poll};
use embedded_hal::digital::v2::{OutputPin, PinState};

#[derive(Copy, Clone, Debug)]
pub enum LedAction {
    Set { is_on: bool },
}

#[derive(Copy, Clone, Debug)]
pub enum LedError<PinError: Debug> {
    PinSet(PinError),
}

pub struct Led<P>
where
    P: OutputPin,
{
    pin: P,
    is_on: bool,
}

impl<P> Led<P>
where
    P: OutputPin,
{
    pub fn new(pin: P) -> Self {
        Self { pin, is_on: false }
    }
}

impl<P> Actuator for Led<P>
where
    P: OutputPin,
    P::Error: Debug,
{
    type Action = LedAction;
    type Error = LedError<P::Error>;

    pub fn run(&mut self, action: &Self::Action) {
        match action {
            LedAction::Set { is_on } => self.is_on = *is_on,
        }
    }

    pub fn poll(&mut self) -> Poll<Result<(), Self::Error>> {
        self.pin
            .set_state(PinState::from(self.is_on))
            .map_err(LedError::PinSet)?;

        Poll::Ready(Ok(()))
    }
}
```

The code is similar, except now we're implementing the `Actuator` trait instead of implementing those methods directly on the struct.

### Same `Runner`, different generics

And now we can improve the `Runner` struct:

```rust
pub struct Runner<GreenLed, BlueLed, RedLed>
where
    GreenLed: Actuator<Action = LedAction>,
    BlueLed: Actuator<Action = LedAction>,
    RedLed: Actuator<Action = LedAction>,
{
    active_commands: VecDeque<Command>,
    green_led: GreenLed,
    blue_led: BlueLed,
    red_led: RedLed,
}
```

By using a trait, we're able to hide the generics of the implementing struct and instead focus our generics on the structs we need.

We are saying: `Runner` will receive three types (named `GreenLed`, `BlueLed`, and `RedLed`), where each type must implement the `Actuator` trait where the associated type `Action` is `LedAction`. Those three types correspond to a struct, and in this case correspond to the `Led` struct, but we didn't specify so as to be generic.

Now the definition of `Runner` doesn't "leak" the generic types of `Led`.

For completeness:

```rust
use alloc::collections::VecDeque;
use core::fmt::Debug;
use core::task::Poll;

#[derive(Copy, Clone, Debug)]
pub enum Command {
    GreenLed(LedAction),
    BlueLed(LedAction),
    RedLed(LedAction),
}

pub enum CommandError<GreenLedError: Debug, BlueLedError: Debug, RedLedError: Debug> {
    GreenLedError(GreenLedError),
    BlueLedError(BlueLedError),
    RedLedError(RedLedError),
}

pub struct Runner<GreenLed, BlueLed, RedLed>
where
    GreenLed: Actuator<Action = LedAction>,
    BlueLed: Actuator<Action = LedAction>,
    RedLed: Actuator<Action = LedAction>,
{
    active_commands: VecDeque<Command>,
    green_led: GreenLed,
    blue_led: BlueLed,
    red_led: RedLed,
}

impl<GreenLed, BlueLed, RedLed> Runner<GreenLed, BlueLed, RedLed>
where
    GreenLed: Actuator<Action = LedAction>,
    GreenLed::Error: Debug,
    BlueLed: Actuator<Action = LedAction>,
    BlueLed::Error: Debug,
    RedLed: Actuator<Action = LedAction>,
    RedLed::Error: Debug,
{
    pub fn new(green_led: GreenLed, blue_led: BlueLed, red_led: RedLed) -> Self {
        Self {
            active_commands: VecDeque::new(),
            green_led,
            blue_led,
            red_led,
        }
    }

    pub fn run(&mut self, command: Command) {
        match command {
            Command::GreenLed(action) => self.green_led.run(&action),
            Command::BlueLed(action) => self.blue_led.run(&action),
            Command::RedLed(action) => self.red_led.run(&action),
        }
        self.active_commands.push_back(command);
    }

    pub fn poll(
        &mut self,
    ) -> Poll<Result<(), CommandError<GreenLed::Error, BlueLed::Error, RedLed::Error>>> {
        let num_commands = self.active_commands.len();
        for _command_index in 0..num_commands {
            let command = self.active_commands.pop_front().unwrap();
            let result = match command {
                Command::GreenLed(_) => self
                    .green_led
                    .poll()
                    .map_err(|err| CommandError::GreenLedError(err)),
                Command::BlueLed(_) => self
                    .blue_led
                    .poll()
                    .map_err(|err| CommandError::BlueLedError(err)),
                Command::RedLed(_) => self
                    .red_led
                    .poll()
                    .map_err(|err| CommandError::RedLedError(err)),
            };

            match result {
                Poll::Ready(Ok(())) => {}
                Poll::Ready(Err(err)) => {
                    self.active_commands.push_back(command);

                    return Poll::Ready(Err(err.into()));
                }
                Poll::Pending => {
                    self.active_commands.push_back(command);
                }
            }
        }

        if self.active_commands.len() == 0 {
            Poll::Ready(Ok(()))
        } else {
            Poll::Pending
        }
    }
}
```

However we still have the problem where the shape of 3 LEDs: green, blue, and red, is pre-defined.

## TODO
