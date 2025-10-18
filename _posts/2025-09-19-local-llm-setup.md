---
layout: post
title: Local LLMs I - Setting up a home computer
subtitle: In which I try to make my NVIDIA drivers work
date: 2025-09-19
tags:
  - local-llm
---

# I got a new computer

So I bought a new computer (in [PcComponentes](https://www.pccomponentes.com/), as usual) to ~~play games~~ code LLM apps. (Ok, to [play games](https://store.steampowered.com/agecheck/app/1086940/) too.)

To run local models and have an ok experience with games without going crazy with the budget, I went with an RTX 5060 Ti 16GB, with a Ryzen 9 7900 and 64GB CL30. No complaints so far.

<figure>
  <img src="/assets/images/2025-11-01-local-llm-setup/2025-09-27-20-16-43.png" alt="Not bad" />
  <figcaption>Not bad</figcaption>
</figure><br/>


I set up a dual boot with Windows 11 (for gaming) and Ubuntu 25.04 (for coding). The reason for the Ubuntu version is the graphics card: it is very new, and finding good NVIDIA drivers is tricky. In fact, I still have some issues while I write this.

# Configuring the system

The computer is very loud by default, mainly because the fans aren't configured to operate based on temperature. The BIOS has an option to configure all fans so their speed depends on the CPU temperature.
<figure>
  <img src="/assets/images/2025-11-01-local-llm-setup/2025-09-27-20-34-58.png" alt="Fan curves are fun!" />
  <figcaption>Fan curves are fun!</figcaption>
</figure><br/>

## Configuring the operating systems

Configuring Windows is rather simple: install the drivers from the Nvidia page. That is, of course, if you manage to complete the Windows 11 installation. You see, apparently, there is a known bug where it sometimes refuses to recognize your internet connection.

<figure>
  <img src="/assets/images/2025-11-01-local-llm-setup/2025-09-27-21-33-38.png" alt="You think you have an Internet connection? I don't think so." />
  <figcaption>You think you have an Internet connection? I don't think so.</figcaption>
</figure><br/>

There is a hack for this: `Shift+F10` to open a console, and type this:

```
OOBE\BYPASSNRO
```

Also, with the dual boot, there is an incompatibility between Windows and Linux. For Linux, the hardware clock is set to UTC, whereas Windows defaults to local time (UTC+2 in my case). Fun fact: having the wrong time messes with HTTPS, so the browser will refuse to load most websites. Fortunately, the fix is easy: go to the Windows registry, look for the `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TimeZoneInformation` key, create a `RealTimeIsUniversal` value, and set it to `1`.

## Linux NVIDIA drivers

As for Linux, I had several issues due to my monitor, a Samsung M7 32". Good monitor, but with crappy software, and very picky with the [EDID handshake](https://www.firefold.com/blogs/news/edid-and-the-hdmi-handshake) that wakes the monitor up from sleep. Long story short, I got a new HDMI cable and had to change from Wayland to Xorg.

To see what drivers are available, we type `ubuntu-drivers devices`:

```
modalias : pci:v000010DEd00002D04sv00001043sd00008A07bc03sc00i00
vendor   : NVIDIA Corporation
driver   : nvidia-driver-580-open - third-party non-free recommended
driver   : nvidia-driver-580-server-open - distro non-free
driver   : nvidia-driver-570-open - third-party non-free
driver   : nvidia-driver-570-server - distro non-free
driver   : nvidia-driver-580 - third-party non-free
driver   : nvidia-driver-580-server - distro non-free
driver   : nvidia-driver-570-server-open - distro non-free
driver   : nvidia-driver-570 - third-party non-free
driver   : xserver-xorg-video-nouveau - distro free builtin
```

I tried both `nvidia-driver-580-open` and `nvidia-driver-580`, but only the open version worked. It is the one more suited for new GPUs, so I went with it. It works with no issues (so far).

Now we are ready to think about running LLMs locally. I will write about that in the [next post]({% post_url 2025-10-03-local-llm-options %}).

