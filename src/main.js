const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pieces = document.getElementById("pieces");
const fen_input = document.getElementById("fen");
const status = document.getElementById("status");
const axes = document.getElementById("axes");
const axes_ctx = axes.getContext("2d");

const MARGIN = 16;
const BOARD_MARGIN = 16;
const BORDER_WIDTH = 4;
const FILL_LIGHT = "#909090";
const FILL_DARK = "#606060";
const AXIS_HOVER_FILL = "#80808060";
const FONT_SIZE = 16;
const AXES_MARGIN = 8;

let selected_piece = PIECES.BLANK;
let piece_buttons = [];
let piece_images = [];
let assets_ready = false;
let board_state = {};
let previous_value = "";
let clickable_regions = [];
let position_data = null;

let mouse_down = false;
let mouse_vx = null;
let mouse_vy = null;
let mouse_l = null;
let mouse_t = null;

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

function update_fen() {
    let base_fen = fen_input.value;

    base_fen = base_fen.replace(/\[([^\]]+)\]/g, (full, inner) => {
        let match = /^([a-zA-Z0-9*+/]+):([+-]?\d+):(\d+):([wb])$/.exec(inner);
        if (!match) {
            return full;
        }
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
    });

    if (fen_input.value !== base_fen) {
        fen_input.value = base_fen;
    }
}

function resize_canvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    axes.width = canvas.width;
    axes.height = canvas.height;
}

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
        if (!/^-?\d+:-?\d+/.exec(coords)) continue;
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
            (canvas.width - MARGIN) / 2 / (max_l - min_l + 1),
            (canvas.height - MARGIN) / 2 / (max_t - min_t + 1)
        ),
        MIN_BOARD_SIZE
    );
    let sx = canvas.width / 2 - board_size * (max_t - min_t + 1) / 2;
    let sy = canvas.height / 2 - board_size * (max_l - min_l + 1) / 2;
    let tile_size = Math.round((board_size - BOARD_MARGIN) / Math.max(board_state.width, board_state.height));

    position_data = {min_l, max_l, min_t, max_t, board_size, sx, sy, tile_size};

    for (let [l, t, board] of boards) {
        let vx = Math.round(sx + (t - min_t) * board_size + BOARD_MARGIN / 2);
        let vy = Math.round(sy + (l - min_l) * board_size + BOARD_MARGIN / 2);
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
                ctx.beginPath();
                ctx.rect(
                    vx + x * tile_size,
                    vy + y * tile_size,
                    tile_size,
                    tile_size
                );
                ctx.fillStyle = (x + y) % 2 === 0 ? FILL_LIGHT : FILL_DARK;
                ctx.fill();
                if (piece) {
                    ctx.drawImage(
                        piece_images[piece.id],
                        vx + x * tile_size,
                        vy + y * tile_size,
                        tile_size,
                        tile_size,
                    );
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
        ctx.strokeStyle = "#202a20";
        ctx.lineWidth = BORDER_WIDTH;
        ctx.stroke();
        update_axes();
    }
}

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

function update_input() {
    let value = fen_input.value;
    if (value === previous_value) return;
    previous_value = value;
    board_state = parse(value);
    update_status();
    render();
}

function update_axes() {
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
    }

    axes_ctx.fillStyle = "#000000";
    axes_ctx.font = FONT_SIZE + "px monospace";
    for (let l = position_data.min_l; l <= position_data.max_l; l++) {
        axes_ctx.fillText(
            `L${l > 0 ? '+' + l : l}`,
            AXES_MARGIN,
            position_data.sy + position_data.board_size * (l - position_data.min_l + .5) - FONT_SIZE / 2,
        );
    }

    for (let t = position_data.min_t - 1; t <= position_data.max_t + 1; t++) {
        axes_ctx.save();
        axes_ctx.translate(
            position_data.sx + position_data.board_size * (t - position_data.min_t + .5) - FONT_SIZE / 2,
            AXES_MARGIN,
        );
        axes_ctx.rotate(Math.PI / 2);
        axes_ctx.fillText(`T${(t >= -1 ? '+' : '') + Math.floor((t + 2) / 2) + (t % 2 === 0 ? 'w' : 'b')}`, 0, 0);
        axes_ctx.restore();
    }
}

let piece_promises = [];
// Initial setup
for (let piece in PIECE_ASSETS) {
    let elem = document.createElement("li");
    elem.onclick = () => {
        if (selected_piece === +piece) {
            selected_piece = 0;
        } else {
            selected_piece = +piece;
        }
        update_pieces();
    };
    elem.id = piece;
    elem.title = PIECE_NAMES[piece];
    let svg = document.createElement("img");
    svg.src = PIECE_ASSETS[piece];
    piece_promises.push(new Promise((resolve, reject) => {
        svg.onload = () => resolve(svg);
        svg.onerror = (err) => reject(err);
    }));
    piece_images[piece] = svg;
    elem.appendChild(svg);
    pieces.appendChild(elem);
    piece_buttons[piece] = elem;
}
fen_input.onchange = fen_input.onkeyup = () => {
    update_input();
};

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

canvas.onmousemove = (evt) => {
    mouse_vx = evt.layerX;
    mouse_vy = evt.layerY;
    update_axes();
    if (mouse_down) {
        drag_piece();
    }
}

canvas.onmousedown = (evt) => {
    mouse_down = true;
    mouse_vx = evt.layerX;
    mouse_vy = evt.layerY;
    update_axes();
    drag_piece();
}

canvas.onmouseup = (evt) => {
    mouse_down = false;
    mouse_vx = evt.layerX;
    mouse_vy = evt.layerY;
    update_axes();
}

canvas.onmouseleave = () => {
    mouse_down = false;
}

function drag_piece() {
    for (let region of clickable_regions) {
        if (
            mouse_vx >= region[0] && mouse_vx - region[0] <= region[2]
            && mouse_vy >= region[1] && mouse_vy - region[1] <= region[3]
        ) {
            let board = board_state[region[4] + ":" + region[5]];
            board[region[7]][region[6]] = selected_piece ? new Piece(selected_piece, false) : null;
            render();
            update_fen();
            return
        }
    }
}
