# 5D Chess variant designer

This is a simple static webapp to design your own [5D Chess](https://5dchesswithmultiversetimetravel.com/) variants, using [5DFEN and 5DPGN](https://github.com/adri326/5dchess-notation/).

[You can try it out here!](https://adri326.github.io/5dchess-variants)

## Installing and running

Clone this repository and navigate to it:

```sh
git clone https://github.com/adri326/5dchess-variants/
cd 5dchess-variants
```

You may then open your browser and navigate to this file, or run a static webserver in the root directory:

```sh
# Open in a browser:
firefox ./index.html

# Run a static webserver with the php server utility:
php -S localhost:8080
firefox http://localhost:8080/
```

## Using the generated 5DFEN

This client can be used to preview the 5DFEN, but it isn't designed to be used to play on it.
You will find a full list of the open source clients and tools that can be used to import these on the [Open 5D Chess discord server](https://discord.chessin5d.net/); here are some of them:

- [https://chessin5d.net/](https://chessin5d.net/), a fully-featured HTML5 client
- [AquaBaby's GUI](https://github.com/Slavrick/5dChessGUI), a Java client with focus towards interfacing with community-made bots
- [5dchess-tools](https://github.com/adri326/5dchess-tools) (a library and bot in Rust) and [5dchess-notation](https://github.com/adri326/5dchess-notation) (a converter between different notations and simple CLI previewer in Node.JS)
- [tesseract's checkmate detection utility](https://github.com/penteract/cwmtt), developped in Haskell and able to accurately and efficiently solve complex checkmates
- [Alexbay's 5DChess discord bot](https://gitlab.com/alexbay218/5d-chess-discord), which can be used to render positions on Discord
