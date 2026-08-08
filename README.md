# No Algorithms

No Algorithms is an open-source tool designed to make social media intentional again.

Instead of completely blocking social media or setting arbitrary screen-time limits, No Algorithms removes the parts designed around algorithmic, infinite consumption while keeping the useful parts of each platform accessible.

Search for something. Watch a video. Check a creator you follow. Open something a friend sent you.

Just don't get trapped scrolling.

## Current Status

No Algorithms is currently in development, with a working prototype running on iOS.

The core system for detecting supported websites and modifying their content is functional. The current prototype can redirect supported native apps to their web versions and run platform-specific filtering rules on those websites.

Initial development is focused on:

* YouTube
* Instagram

The current prototype is intentionally more aggressive than the finished product and can block entire groups of content while the individual filtering rules are developed.

## How It Works

No Algorithms combines two components:

### App Redirects

Opening a supported social media app redirects the user to its web version.

This allows No Algorithms to modify the experience without needing access to the internal functionality of the native application.

### Web Filtering

Once on the website, No Algorithms runs platform-specific rules that can hide, modify, or redirect parts of the site.

The system responds to both DOM changes and navigation inside modern single-page web applications, allowing filters to continue working as the user moves around a site.

## Framework

The filtering system is designed to be modular.

Individual features can define their own:

* **JSON configuration** — where and when the feature should run
* **JavaScript** — custom detection or behaviour
* **CSS** — visual filtering and hiding elements
* **Redirect rules** — preventing access to specific routes such as `/shorts`

This means support for a platform doesn't have to be written as one giant script. Individual algorithmic features can be added, changed, or disabled independently.

For example, YouTube could have separate modules for Shorts, homepage recommendations, related videos, and other algorithmic surfaces.

## Vision

The goal is **not to remove social media**.

No Algorithms is designed around the distinction between *intentional use* and *algorithmic consumption*.

The finished app will provide a simple interface where users choose which parts of each platform they want removed.

Planned controls include:

* Individual feature toggles for each platform
* Scheduled blocking
* Temporary blocks
* Indefinite blocks
* App-to-web redirection
* Platform-specific filtering
* Support for content shared directly by friends while removing equivalent algorithmically recommended content

The project will initially focus on YouTube and Instagram, with additional platforms potentially added later.

## What Makes It Different

Most digital-wellbeing tools solve excessive social media use by restricting **time**.

No Algorithms instead restricts **how the platform can capture your attention**.

Rather than:

> You have 15 minutes left on Instagram.

the goal is:

> Use Instagram for as long as you want — but decide what you're there to do.

That means keeping functionality such as search, subscriptions/following, profiles, messages, and intentionally opened content while removing things like infinite recommendation feeds and short-form algorithmic content.

No Algorithms isn't intended to be another productivity timer or complete social media blocker. It is an attempt to create a different version of the existing platforms: one where the user chooses what to consume instead of an algorithm continuously choosing for them.

## Planned Release

No Algorithms is planned as a **free, open-source project**.

The primary target is **iOS**, where the current prototype is being developed and tested.

Android support is also planned, with the same overall goal of redirecting supported apps into a controlled web experience and applying the appropriate filtering rules.

Browser-based support is a natural part of the project architecture as well, since the filtering system itself operates on the web versions of supported platforms.

## Roadmap

**Current**

* Working iOS prototype
* App-to-web redirection
* Web content filtering
* Modular feature system
* DOM and navigation monitoring
* YouTube and Instagram development

**Next**

* Individual feature filtering
* User-facing toggle interface
* Scheduling
* Temporary and indefinite blocks
* More precise handling of followed, searched, recommended, and shared content
* Friend testing

**Later**

* Public iOS release
* Android support
* Additional platforms
* Community contributions to platform filters

---

No Algorithms is built around a simple idea:

**Social media should be a tool you use, not a feed that uses you.**
