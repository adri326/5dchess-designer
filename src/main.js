const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const axes = document.getElementById("axes");
const axes_ctx = axes.getContext("2d");

// Button list for selecting both white's and black's pieces
const pieces_white = document.getElementById("pieces-white");
const pieces_black = document.getElementById("pieces-black");

// FEN input box
const fen_input = document.getElementById("fen");

// "Current mode" buttons
const space_around_button = document.getElementById("space-around");
const edit_pieces_button = document.getElementById("edit-pieces");

// "Add next piece as: [Not yet moved] / [Already moved]"
const moved_button = document.getElementById("moved");
const not_moved_button = document.getElementById("not-moved");

// Input fields for the dimensions of the board and button to set the dimensions
const width_input = document.getElementById("width");
const height_input = document.getElementById("height");
const empty_button = document.getElementById("empty");

// Dropdown and button for the presets
const preset_dropdown = document.getElementById("presets");
const preset_button = document.getElementById("set-preset");

// Status box
const status = document.getElementById("status");

const DPR = window.devicePixelRatio || 1;
const MARGIN = 48 * DPR;
const BOARD_MARGIN = 32 * DPR;
const BORDER_WIDTH = 8 * DPR;
const FONT_SIZE = 16 * DPR;
const AXES_MARGIN = 8 * DPR;
const PLUS_SIZE = 6;
const PIECE_MARGIN = 0.05;
const LABEL_SIZE = 0.2;

const FILL_LIGHT = "#EDBEA1";
const FILL_DARK = "#A37583";
const LABEL_LIGHT = "#181818";
const LABEL_DARK = "#e0e0e0";
const AXIS_HOVER_FILL = "#60577060";
const BOARD_OUTLINE_DARK = "#301014";
const BOARD_OUTLINE_LIGHT = "#4D4861";

const COORDS_REGEX = /^-?\d+:-?\d+/;

let space_around = false;
let selected_piece = PIECES.BLANK;
let piece_buttons = [document.getElementById("0")];
let piece_images = [];
let assets_ready = false;
let board_state = {};
let previous_value = "";
let clickable_regions = [];
let position_data = null;
let moved = false;

let mouse_down = false;
let mouse_vx = null;
let mouse_vy = null;
let mouse_l = null;
let mouse_t = null;
let prev_mouse_l = mouse_l;
let prev_mouse_t = mouse_t;

/// Updates the "selected" class for the piece selection buttons
function update_pieces() {
    for (let button of piece_buttons) {
        if (!button) continue;
        if (selected_piece == button.id) {
            button.className = "selected";
        } else {
            button.className = "";
        }
    }
}

/// Updates the FEN field based on the `board_state` object.
function update_fen() {
    let base_fen = fen_input.value;

    base_fen = base_fen.replace(/\[([^\]]+)\]/g, (full, inner) => {
        let match = /^([a-zA-Z0-9*+/]+):([+-]?\d+):(\d+):([wb])$/.exec(inner);
        if (match) {
            let coords = +match[2] + ":" + ((+match[3] - 1) * 2 + (match[4] === "w" ? 0 : 1));
            let board = board_state[coords];
            let fen = "";
            for (let row of board) {
                let count_empty = 0;

                for (let piece of row) {
                    if (piece) {
                        if (count_empty > 0) {
                            fen += +count_empty;
                            count_empty = 0;
                        }
                        fen += PIECES_FEN[piece.id];
                        if (PIECES_MOVED_NEEDED[piece.id] && !piece.moved) {
                            fen += "*";
                        }
                    } else {
                        count_empty++;
                    }
                }

                if (count_empty > 0) fen += +count_empty;
                fen += "/";
            }
            fen = fen.slice(0, -1);
            return `[${fen}:${match[2]}:${match[3]}:${match[4]}]`;
        }

        match = /^\s*(\w+)\s+"([^\"]+)"\s*$/.exec(inner);
        if (match) {
            if (match[1].toLowerCase() === "size") {
                return `[Size "${board_state.width}x${board_state.height}"]`
            } else {
                return full;
            }
        }

        return full;
    });

    if (fen_input.value !== base_fen) {
        fen_input.value = base_fen;
    }
}

/// Resizes the canvas
function resize_canvas() {
    canvas.width = canvas.clientWidth * DPR;
    canvas.height = canvas.clientHeight * DPR;
    axes.width = canvas.width;
    axes.height = canvas.height;
}

/// Renders `board_state` on the main canvas and calls `render_axes`
function render() {
    if (!assets_ready) return;
    if (!board_state || board_state instanceof Error) return;

    const MIN_BOARD_SIZE = 16 * Math.max(board_state.width, board_state.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clickable_regions = [];

    let boards = [];

    let min_l = 0;
    let max_l = 0;
    let min_t = 0;
    let max_t = 0;

    for (let coords in board_state) {
        if (!COORDS_REGEX.exec(coords)) continue;
        let [l, t] = coords.split(":").map(x => +x);
        let board = board_state[coords];
        boards.push([l, t, board]);
        if (l < min_l) min_l = l;
        if (l > max_l) max_l = l;
        if (t < min_t) min_t = t;
        if (t > max_t) max_t = t;
    }

    let board_size = Math.max(
        Math.min(
            (canvas.width - MARGIN * 2) / (max_t - min_t + 1 + 2 * space_around),
            (canvas.height - MARGIN * 2) / (max_l - min_l + 1 + 2 * space_around)
        ),
        MIN_BOARD_SIZE
    );
    let sx = canvas.width / 2 - board_size * (max_t - min_t + 1) / 2;
    let sy = canvas.height / 2 - board_size * (max_l - min_l + 1) / 2;
    let tile_size = Math.round((board_size - BOARD_MARGIN) / Math.max(board_state.width, board_state.height));

    let dv = (board_size - BOARD_MARGIN - tile_size * Math.max(board_state.width, board_state.height)) / 2;

    position_data = {min_l, max_l, min_t, max_t, board_size, sx, sy, tile_size};

    for (let [l, t, board] of boards) {
        let vx = Math.round(sx + (t - min_t) * board_size + BOARD_MARGIN / 2 + dv);
        let vy = Math.round(sy + (l - min_l) * board_size + BOARD_MARGIN / 2 + dv);
        for (let y = 0; y < board_state.height; y++) {
            for (let x = 0; x < board_state.width; x++) {
                let piece = board[y][x];
                clickable_regions.push([
                    vx + x * tile_size,
                    vy + y * tile_size,
                    tile_size,
                    tile_size,
                    l,
                    t,
                    x,
                    y,
                ]);
                // Background
                ctx.beginPath();
                ctx.rect(
                    vx + x * tile_size,
                    vy + y * tile_size,
                    tile_size,
                    tile_size
                );
                ctx.fillStyle = (x + y) % 2 === 0 ? FILL_LIGHT : FILL_DARK;
                ctx.fill();

                if (!space_around) {
                    // Number
                    if (x == 0) {
                        ctx.font = Math.round(tile_size * LABEL_SIZE) + "px monospace";
                        ctx.fillStyle = (x + y) % 2 === 0 ? LABEL_LIGHT : LABEL_DARK;
                        ctx.textAlign = "left";
                        ctx.textBaseline = "top";
                        ctx.fillText(`${board_state.height - y}`, vx + (x + 0.05) * tile_size, vy + (y + 0.1) * tile_size);
                    }
                    // Letter
                    if (y == board_state.height - 1) {
                        ctx.font = Math.round(tile_size * LABEL_SIZE) + "px monospace";
                        ctx.fillStyle = (x + y) % 2 === 0 ? LABEL_LIGHT : LABEL_DARK;
                        ctx.textAlign = "right"
                        ctx.textBaseline = "bottom";
                        ctx.fillText(`${ALPHABET[x]}`, vx + (x + 0.95) * tile_size, vy + (y + 1) * tile_size);
                    }
                }

                if (piece) {
                    if (space_around) {
                        ctx.drawImage(
                            piece_images[piece.id],
                            vx + x * tile_size,
                            vy + y * tile_size,
                            tile_size,
                            tile_size,
                        );
                    } else {
                        if (PIECES_MOVED_NEEDED[piece.id]) {
                            if (tile_size > 24 && piece.moved) {
                                ctx.beginPath();
                                ctx.arc(
                                    vx + (x + .5) * tile_size,
                                    vy + (y + .5) * tile_size,
                                    tile_size / 2 - 6,
                                    tile_size / 2 - 6,
                                    0,
                                    Math.PI * 2,
                                );
                                ctx.strokeStyle = piece.moved ? "#30101480" : "#F2EDF080";
                                ctx.lineWidth = 4;
                                ctx.stroke();
                            }
                            ctx.filter = `drop-shadow(0px 0px ${tile_size / 6}px ${piece.moved ? "#301014A0" : "#F2EDF0C0"})`;
                        }

                        ctx.drawImage(
                            piece_images[piece.id],
                            Math.round(vx + (x + PIECE_MARGIN) * tile_size),
                            Math.round(vy + (y + PIECE_MARGIN) * tile_size),
                            Math.round(tile_size - PIECE_MARGIN * 2 * tile_size),
                            Math.round(tile_size - PIECE_MARGIN * 2 * tile_size),
                        );
                        ctx.filter = "none";
                    }
                }
            }
        }

        ctx.beginPath();
        ctx.rect(
            vx - BORDER_WIDTH / 2,
            vy - BORDER_WIDTH / 2,
            board_state.width * tile_size + BORDER_WIDTH,
            board_state.height * tile_size + BORDER_WIDTH,
        );
        ctx.strokeStyle = t % 2 === 0 ? BOARD_OUTLINE_LIGHT : BOARD_OUTLINE_DARK;
        ctx.lineWidth = BORDER_WIDTH;
        ctx.stroke();
        render_axes();
    }
}

/// Updates the status bar
function update_status() {
    if (board_state instanceof Error) {
        status.innerText = board_state.toString();
        status.className = "err";
        return
    }

    if (!assets_ready) {
        status.innerText = "Loading...";
        status.className = "ok";
        return
    }

    status.innerText = "OK";
    status.className = "ok";
}

let was_error = false;
/// Parses the input field if it has changed
function update_input() {
    let value = fen_input.value;
    if (value === previous_value) return;
    previous_value = value;
    board_state = parse(value);
    if (board_state instanceof Error) {
        was_error = true;
        update_status();
        console.error(board_state);
    } else if (was_error) {
        was_error = false;
        update_status();
    }
    render();
}

/// Renders the axes and super-physical coordinate labels
function render_axes() {
    if (!assets_ready) return;
    if (!board_state || board_state instanceof Error) return;
    if (!position_data) return;

    axes_ctx.clearRect(0, 0, axes.width, axes.height);

    if (mouse_vx !== null && mouse_vy !== null) {
        mouse_t = Math.floor((mouse_vx - position_data.sx) / position_data.board_size) + position_data.min_t;
        mouse_l = Math.floor((mouse_vy - position_data.sy) / position_data.board_size) + position_data.min_l;

        let sx = position_data.sx + (mouse_t - position_data.min_t) * position_data.board_size;
        let sy = position_data.sy + (mouse_l - position_data.min_l) * position_data.board_size;
        axes_ctx.beginPath();
        axes_ctx.rect(sx, 0, position_data.board_size, axes.height);
        axes_ctx.fillStyle = AXIS_HOVER_FILL;
        axes_ctx.fill();
        axes_ctx.beginPath();
        axes_ctx.rect(0, sy, axes.width, position_data.board_size);
        axes_ctx.fillStyle = AXIS_HOVER_FILL;
        axes_ctx.fill();

        let cx = sx + position_data.board_size / 2;
        let cy = sy + position_data.board_size / 2;

        if (space_around && board_state && !board_state[mouse_l + ":" + mouse_t]) {
            axes_ctx.beginPath();
            let line_width = position_data.board_size * .035;
            axes_ctx.moveTo(
                cx - line_width,
                cy - line_width
            );
            [
                [-1, -PLUS_SIZE],
                [1, -PLUS_SIZE],
                [1, -1],
                [PLUS_SIZE, -1],
                [PLUS_SIZE, 1],
                [1, 1],
                [1, PLUS_SIZE],
                [-1, PLUS_SIZE],
                [-1, 1],
                [-PLUS_SIZE, 1],
                [-PLUS_SIZE, -1],
                [-1, -1],
            ].forEach(([x, y]) => {
                axes_ctx.lineTo(
                    cx + x * line_width,
                    cy + y * line_width
                );
            });
            if (
                window.matchMedia("(hover: none)").matches
                || mouse_vx >= cx - line_width * PLUS_SIZE
                && mouse_vx <= cx + line_width * PLUS_SIZE
                && mouse_vy >= cy - line_width * PLUS_SIZE
                && mouse_vy <= cy + line_width * PLUS_SIZE
            ) {
                axes_ctx.fillStyle = "#ffffff80";
            } else {
                axes_ctx.fillStyle = "#00000060";
            }
            axes_ctx.fill();
        }
    }

    axes_ctx.fillStyle = "#000000";
    axes_ctx.font = FONT_SIZE + "px monospace";
    for (let l = position_data.min_l - space_around; l <= position_data.max_l + space_around; l++) {
        axes_ctx.fillText(
            `L${l > 0 ? '+' + l : l}`,
            AXES_MARGIN,
            position_data.sy + position_data.board_size * (l - position_data.min_l + .5) - FONT_SIZE / 2,
        );
    }

    for (let t = position_data.min_t - 1 - space_around; t <= position_data.max_t + 1 + space_around; t++) {
        axes_ctx.save();
        axes_ctx.translate(
            position_data.sx + position_data.board_size * (t - position_data.min_t + .5) - FONT_SIZE / 2,
            AXES_MARGIN,
        );
        axes_ctx.rotate(Math.PI / 2);
        axes_ctx.fillText(`T${(t > -1 ? '+' : '') + Math.floor((t + 2) / 2) + (t % 2 === 0 ? 'w' : 'b')}`, 0, 0);
        axes_ctx.restore();
    }
}

let piece_promises = [];
// Initial setup
for (let piece in PIECE_ASSETS) {
    let elem = document.createElement("li");
    // Special case: black's blank
    if (piece == PIECES.B_OFFSET) {
        elem.onclick = () => {
            selected_piece = 0;
            update_pieces();
        };
    } else {
        elem.onclick = () => {
            if (selected_piece === +piece) {
                selected_piece = 0;
            } else {
                selected_piece = +piece;
            }
            update_pieces();
        };
    }
    elem.id = piece;
    elem.title = PIECE_NAMES[piece];
    if (piece == 0 || piece == PIECES.B_OFFSET) elem.className = "selected";
    let svg = document.createElement("img");
    svg.src = PIECE_ASSETS[piece];
    piece_promises.push(new Promise((resolve, reject) => {
        svg.onload = () => resolve(svg);
        svg.onerror = (err) => reject(err);
    }));
    piece_images[piece] = svg;
    elem.appendChild(svg);
    if (+piece < PIECES.B_OFFSET) {
        pieces_white.appendChild(elem);
    } else {
        pieces_black.appendChild(elem);
    }
    piece_buttons[piece] = elem;
}
fen_input.onchange = fen_input.onkeyup = () => {
    update_input();
};

// Button behavior

moved_button.onclick = () => {
    moved = true;
    moved_button.className = "selected";
    not_moved_button.className = "";
    window.document.body.classList.add("moved");
};

not_moved_button.onclick = () => {
    moved = false;
    moved_button.className = "";
    not_moved_button.className = "selected";
    window.document.body.classList.remove("moved");
};

empty_button.onclick = () => {
    fen_input.value = `[Size "${+width_input.value}x${+height_input.value}"]
[Board "custom"]
[Mode "5D"]
[${(+width_input.value + "/").repeat(+height_input.value).slice(0, -1)}:0:1:w]
`;
    update_input();
};

preset_button.onclick = () => {
    fen_input.value = PRESETS[preset_dropdown.value];
    update_input();
}

space_around_button.onclick = () => {
    space_around = true;
    space_around_button.className = "selected";
    edit_pieces_button.className = "";
    render();
    render_axes();
    return true;
};

edit_pieces_button.onclick = () => {
    space_around = false;
    space_around_button.className = "";
    edit_pieces_button.className = "selected";
    render();
    render_axes();
    return true;
};

// Set scrollbar width in CSS
document.documentElement.style.setProperty('--scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + "px");

Promise.all(piece_promises).then(() => {
    assets_ready = true;
    update_status();
    render();
});

resize_canvas();
update_input();
window.onresize = () => {
    resize_canvas();
    render();
};

// Canvas interaction

canvas.onmousemove = (evt) => {
    mouse_vx = evt.layerX * DPR;
    mouse_vy = evt.layerY * DPR;
    prev_mouse_l = mouse_l;
    prev_mouse_t = mouse_t;
    render_axes();
    if (mouse_down) {
        drag_piece();
    }
}

canvas.onmousedown = (evt) => {
    mouse_down = true;
    mouse_vx = evt.layerX * DPR;
    mouse_vy = evt.layerY * DPR;
    render_axes();
    drag_piece();
}

canvas.onmouseup = (evt) => {
    mouse_down = false;
    mouse_vx = evt.layerX * DPR;
    mouse_vy = evt.layerY * DPR;
    render_axes();

    // TODO: do this on the second tap on mobile!
    if (
        (!window.matchMedia("(hover: none)").matches || prev_mouse_l === mouse_l && prev_mouse_t === mouse_t)
        && space_around && board_state && !board_state[mouse_l + ":" + mouse_t]
    ) {
        let line_width = position_data.board_size * .035;
        let sx = position_data.sx + (mouse_t - position_data.min_t) * position_data.board_size;
        let sy = position_data.sy + (mouse_l - position_data.min_l) * position_data.board_size;
        let cx = sx + position_data.board_size / 2;
        let cy = sy + position_data.board_size / 2;
        if (
            mouse_vx >= cx - line_width * PLUS_SIZE
            && mouse_vx <= cx + line_width * PLUS_SIZE
            && mouse_vy >= cy - line_width * PLUS_SIZE
            && mouse_vy <= cy + line_width * PLUS_SIZE
        ) {
            let new_fen = `[${
                (board_state.width + "/").repeat(board_state.height).slice(0, -1)
            }:${
                mouse_l
            }:${
                Math.floor(mouse_t / 2) + 1
            }:${
                mouse_t % 2 === 0 ? "w" : "b"
            }]`;
            let fen = fen_input.value.split("\n");
            let index = fen.findIndex(x => !x.startsWith("["));
            if (index == -1) fen.push(new_fen);
            else fen.splice(index, 0, new_fen);
            fen_input.value = fen.join("\n");
            let t = Math.floor(mouse_t / 2) + 1;
            status.innerText = `Added board at (L${mouse_l > 0 ? "+" + mouse_l : mouse_l}:T${t > 0 ? "+" + t : t}${mouse_t % 2 === 0 ? "w" : "b"})`;
        }
    }


    update_input();
}

canvas.onmouseleave = () => {
    mouse_down = false;
}

function drag_piece() {
    if (space_around) return;
    for (let region of clickable_regions) {
        if (
            mouse_vx >= region[0] && mouse_vx - region[0] <= region[2]
            && mouse_vy >= region[1] && mouse_vy - region[1] <= region[3]
        ) {
            let board = board_state[region[4] + ":" + region[5]];
            board[region[7]][region[6]] = selected_piece ? new Piece(selected_piece, moved) : null;

            let t = Math.floor(region[5] / 2) + 1 + (region[5] % 2 === 0 ? "w" : "b");
            status.innerText = `Placed '${PIECE_NAMES[selected_piece]}' at (L${(region[4] > 0 ? "+" : "") + region[4]}:T${region[5] >= 0 ? "+" + t : t}:${ALPHABET[region[6]]}:${board_state.height - region[7]})`;
            status.className = "ok";

            render();
            update_fen();

            return
        }
    }
}
