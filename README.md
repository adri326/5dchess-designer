# 5D Chess variant designer

This is a simple static webapp to design your own [5D Chess](https://5dchesswithmultiversetimetravel.com/) variants, using [5DFEN and 5DPGN](https://github.com/adri326/5dchess-notation/).

[You can try it out here!](https://adri326.github.io/5dchess-designer)

## Installing and running

Clone this repository and navigate to it:

```sh
git clone https://github.com/adri326/5dchess-designer/
cd 5dchess-designer
```

You may then open your browser and navigate to this file, or run a static webserver in the root directory:

```sh
# Open in a browser:
firefox ./index.html

# Run a static webserver with the php server utility:
php -S localhost:8080
firefox http://localhost:8080/
```
## Usage

The UI is organized in four sections:

- The preview (top-right on desktop, 1st on mobile)
- The piece selection menu and status bar (bottom-right on desktop, 2nd on mobile)
- The settings section (bottom-left on desktop, 3rd on mobile)
- The 5DFEN input box (top-left on desktop, 4th on mobile)

The preview shows a preview of the 5DFEN inputted in the 5DFEN input box. It can also be interacted with to add boards or pieces.

The piece selection menu lets you select which piece to add. Pieces can only be placed on the boards if you currently are in the "Add pieces" mode (set in the settings section).
The red cross in the piece selection menu lets you remove pieces from the boards, if it also only effective in the "Add pieces" mode.

The settings section is organized in 3 sub-sections:

- Width and height input: input your desired width and height in the boxes and hit "Set dimensions" to choose a new board size
- Mouse behavior:
  - The "Current mode" buttons allows you to switch between the "Add pieces" mode, which lets you place and remove pieces, and the "Add boards", which lets you add new boards.
  - The "Add next piece as" buttons allows you to tailor the behavior of pawns, kings and rooks, as these pieces behave differently based on whether or not they had already moved. The next pieces that you will place will have the chosen behavior.
- Presets: select a preset from the drop-down and press "Load preset". The preset will overwrite the current position.

"Not yet moved" pieces whose behavior depend on having been moved or not (ie. Pawns, Rooks and Kings) will be highlighted with a white glow and circle.
"Already moved" pieces will be highlighted with a black glow and circle.

The 5DFEN input box allows you to edit the raw 5DFEN. You can type in it, copy or paste things in it.
Syntax errors in the 5DFEN will be reported in the status box.

### Using the generated 5DFEN

This client can be used to preview the 5DFEN, but it isn't designed to be used to play on it.
You will find a full list of the open source clients and tools that can be used to import these on the [Open 5D Chess discord server](https://discord.chessin5d.net/); here are some of them:

- [https://chessin5d.net/](https://chessin5d.net/), a fully-featured HTML5 client
- [AquaBaby's GUI](https://github.com/Slavrick/5dChessGUI), a Java client with focus towards interfacing with community-made bots
- [5dchess-tools](https://github.com/adri326/5dchess-tools) (a library and bot in Rust) and [5dchess-notation](https://github.com/adri326/5dchess-notation) (a converter between different notations and simple CLI previewer in Node.JS)
- [tesseract's checkmate detection utility](https://github.com/penteract/cwmtt), developped in Haskell and able to accurately and efficiently solve complex checkmates
- [Alexbay's 5DChess discord bot](https://gitlab.com/alexbay218/5d-chess-discord), which can be used to render positions on Discord
