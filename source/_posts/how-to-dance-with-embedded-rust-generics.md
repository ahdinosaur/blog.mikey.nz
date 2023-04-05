---
title: How to dance with embedded Rust generics
date: 2023-04-05 14:15:54
tags:
---

As part of [my work](https://villagekit.com) on [Grid Bot "Tahi"](https://github.com/villagekit/gridbot-tahi), I _finally_ figured out how to make my robot code re-usable as a library. Since to do this I needed to go on a deep journey into understanding Rust types, I thought I might share my learnings.

## Embedded Rust

Before we begin, here's a quick recap of the [embedded Rust world](https://github.com/rust-embedded/awesome-embedded-rust):

- Rust can compile to any `target` supported by LLVM, so most everything.
- You can tell Rust to be in "`#[no_std]`" mode and your code will not load the standard library (`std`)  or data structures that depend on heap allocations (`alloc`).
  - To use data structures that depend on heap allocations (`alloc`), you can then BYO (bring your own) allocator, such as [`embedded-alloc`](https://github.com/rust-embedded/embedded-alloc).
- Each processor architecture usually has a Rust module for low-level access to the processor
  - For example: [`cortex-m`](https://github.com/rust-embedded/cortex-m) for ARM processors, [`riscv`](https://github.com/rust-embedded/riscv) for RISC-V processors, etc.
  - Note: most embedded chips use an ARM processor
- Each chip family has a "Peripheral Access Crate" for low level control of registers
  - Hardware manufacturers provide an CMSIS-SVD file (Cortex Microcontroller Software Interface Standard - System View Description), which define how the hardware's (magic) memory addresses are mapped to peripheral registers, [`svd2rust`](https://github.com/rust-embedded/svd2rust) converts these to a type-safe Rust interface, so you can only use the registers in a safe way.
  - For example, the [`stm32-rs`](https://github.com/stm32-rs/stm32-rs) for STM32 microcontrollers, [`nrf-pacs`](https://github.com/nrf-rs/nrf-pacs) for nRF microcontrollers
- Each chip family then also has a "Hardware Abstraction Layer" for higher level control of peripherals
  - To provide a foundation for building device-agnostic hardware drivers, [`embedded-hal`](https://github.com/rust-embedded/embedded-hal) provides [Traits](https://doc.rust-lang.org/book/ch10-02-traits.html) (abstract interfaces) for (most) hardware abstractions.
  - Each each device has their own `xxx-hal` which provides the specific hardware implementations for these abstract interfaces.
  - For example, I'm using a [Nucleo-F767ZI](https://nz.element14.com/stmicroelectronics/nucleo-f767zi/dev-board-nucleo-32-mcu/dp/2546569), which is supported by [`stm32f7xx-hal`](https://github.com/stm32-rs/stm32f7xx-hal).
  - Another example is the `ESP32-C3` is supported by [`es32c3-hal`](https://github.com/esp-rs/esp-hal/tree/main/esp32c3-hal#getting-started)

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
    SetPin(PinError),
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
            .map_err(|err| LedError::SetPin(err))?;

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

## An example `OutputPin`

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

In a real-world situation, these structs are provided by your device's `xxx-hal` library, almost certainly generated with a macro.

## An `Actuator` trait

Moving on, let's say we want our system to support multiple types of few hardware interfaces that affect the real world. We create an `Actuator` trait to generalize our use of hardware interfaces (while still being device agnostic).

```rust
use core::task::Poll;

pub trait Actuator {
    type Action;
    type Error: Debug;

    fn run(&mut self, action: &Self::Action);
    fn poll(&mut self) -> Poll<Result<(), Self::Error>>;
}
```

## `impl Actuator for Led`

Then our LED interface would look like:

```rust
use core::{fmt::Debug, task::Poll};
use embedded_hal::digital::v2::{OutputPin, PinState};

#[derive(Copy, Clone, Debug)]
pub enum LedAction {
    Set { is_on: bool },
}

#[derive(Copy, Clone, Debug)]
pub enum LedError<PinError: Debug> {
    SetPin(PinError),
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
            .map_err(|err| LedError::SetPin(err))?;

        Poll::Ready(Ok(()))
    }
}
```

The code is similar, except now we're implementing the `Actuator` trait instead of implementing those methods directly on the struct.

## A more detailed `Led` interface example

If you're wondering why there's a difference between `run` and `poll`, let's change our LED abstraction so we can tell an LED to blink for a specific amount of time. Since we can't do a blocking `sleep`, you'll see why `poll` is designed to be non-blocking.

```rust
use core::fmt::Debug;
use core::task::Poll;
use fugit::TimerDurationU32 as TimerDuration;
use fugit_timer::Timer;
use nb;

#[derive(Clone, Copy, Debug)]
pub enum LedAction<const TIMER_HZ: u32> {
    Blink { duration: TimerDuration<TIMER_HZ> },
}

#[derive(Clone, Copy, Debug)]
pub enum LedBlinkStatus {
    Start,
    Wait,
    Done,
}

#[derive(Clone, Copy, Debug)]
pub struct LedBlinkState<const TIMER_HZ: u32> {
    status: LedBlinkStatus,
    duration: TimerDuration<TIMER_HZ>,
}

#[derive(Clone, Copy, Debug)]
pub struct Led<P, T, const TIMER_HZ: u32>
where
    P: OutputPin,
    T: Timer<TIMER_HZ>,
{
    pin: P,
    timer: T,
    state: Option<LedBlinkState<TIMER_HZ>>,
}

impl<P, T, const TIMER_HZ: u32> Led<P, T, TIMER_HZ>
where
    P: OutputPin,
    T: Timer<TIMER_HZ>,
{
    pub fn new(pin: P, timer: T) -> Self {
        Self {
            pin,
            timer,
            state: None,
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub enum LedError<PinError: Debug, TimerError: Debug> {
    Pin(PinError),
    Timer(TimerError),
}

impl<P, T, const TIMER_HZ: u32> Actuator for Led<P, T, TIMER_HZ>
where
    P: OutputPin,
    P::Error: Debug,
    T: Timer<TIMER_HZ>,
    T::Error: Debug,
{
    type Action = LedAction<TIMER_HZ>;
    type Error = LedError<P::Error, T::Error>;

    fn run(&mut self, action: &Self::Action) {
        match action {
            LedAction::Blink { duration } => {
                self.state = Some(LedBlinkState {
                    status: LedBlinkStatus::Start,
                    duration: *duration,
                });
            }
        }
    }

    fn poll(&mut self) -> Poll<Result<(), Self::Error>> {
        if let Some(state) = self.state {
            match state.status {
                LedBlinkStatus::Start => {
                    // start timer
                    self.timer
                        .start(state.duration)
                        .map_err(|err| LedError::Timer(err))?;

                    // turn led on
                    self.pin.set_high().map_err(|err| LedError::Pin(err))?;

                    // update state
                    self.state = Some(LedBlinkState {
                        status: LedBlinkStatus::Wait,
                        duration: state.duration,
                    });

                    Poll::Pending
                }
                LedBlinkStatus::Wait => match self.timer.wait() {
                    Err(nb::Error::Other(err)) => Poll::Ready(Err(LedError::Timer(err))),
                    Err(nb::Error::WouldBlock) => Poll::Pending,
                    Ok(()) => {
                        self.state = Some(LedBlinkState {
                            status: LedBlinkStatus::Done,
                            duration: state.duration,
                        });

                        Poll::Pending
                    }
                },
                LedBlinkStatus::Done => {
                    self.pin.set_low().map_err(|err| LedError::Pin(err))?;

                    self.state = None;

                    Poll::Ready(Ok(()))
                }
            }
        } else {
            Poll::Ready(Ok(()))
        }
    }
}
```

Oh gosh that's a mouthful!

In `Led`, we're using a state machine:

- An `LedBlinkState` has a `status` (`LedBlinkStatus`) and a `duration`
- An `LedBlinkStatus` is either `Start`, `Wait`, or `Done`.
- The current `LedBlinkState` state is stored in `self.state`
- The `run` method updates the state with the given duration and a current status of `Start`.
- On poll,
  - If the current state is empty, we're done and we return (send a message to whoever polled us) that we're ready (done).
  - If the current status is `Start`, we turn the LED on, start the timer, and set the status to `Wait`. We return that we're still waiting (pending).
  - If the current status is `Wait`, we check the timer. If it's done, we set the status to `Done`. If the timer is not done ("would block"), then we do nothing. In either case, we return that we're still waiting (pending).
  - If the curent status is `Done`, we turn the LED off, we reset the state to empty, and we return that we're ready (done).
  - In any of these cases, if we get an error, we send the error upwards (as part of saying we're done).

As an aside, a Rust expert might say that `run` should return a `Future`, and then we will use to `poll`. I chose this design because such a future would need a mutable reference to the hardware peripherals (and Rust has strict rules about object ownership, references, and mutability), and I wanted to avoid using allocations (`Rc`). If this is possible on the actuators I've made, I'd love to learn how.

## `Runner`

Now say we want a `Runner` that can receive a command, delegate that command to the associated actuator, and poll all active commands until completion.

We'll start with an easier approach where we know there will be three LEDs: a green LED, a blue LED, and a red LED.

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

Woah!

So let's start by explaining the generics `GreenLed`, `BlueLed`, and `RedLed`:

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

We are saying: `Runner` will receive three types (named `GreenLed`, `BlueLed`, and `RedLed`), where each type will implement the `Actuator` trait where the associated type `Action` is `LedAction`. Those three types correspond to a struct, and in this case correspond to the `Led` struct, but we didn't specify so as to be generic.

If we _did_ specifically use the `Led` struct, here's what that would look like instead:

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

Now, this looks okay, but this is only considering our original `Led` struct that only needs a `P: OutputPin`. In our later `Led` struct, we need two more generics: `T: Timer<HZ>` and `const HZ: u32`. By using a trait, we're able to hide the generics of the implementing struct and instead focus our generics on the structs we need.

So, moving on:

- `Runner` keeps track of "active commands" with a double-ended queue (`VecDeque`).
- In the `run` method: receives a new command, finds the corresponding actuator, calls `run` on the corresponding actuator, and then stores the command in the list of active commands.
- In the `poll` method: for each active command, find the corresponding actuator, and call `poll` on the corresponding actuator. If the corresponding actuator says it's done, then remove the command from the list of active commands. If at the end, we have zero active commands, then we're done.

## TODO


