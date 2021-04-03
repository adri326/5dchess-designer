const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pieces = document.getElementById("pieces");
const fen_input = document.getElementById("fen");
const status = document.getElementById("status");

let selected_piece = PIECES.BLANK;
let piece_buttons = [];
let assets_ready = false;
let board_state = {};
let previous_value = "";

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

function resize_canvas() {
    ctx.width = canvas.width = canvas.clientWidth;
    ctx.height = canvas.height = canvas.clientHeight;
}

function render() {
    if (!assets_ready) return;
    console.log("Render!");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    elem.appendChild(svg);
    pieces.appendChild(elem);
    piece_buttons[piece] = elem;
}
fen_input.onchange = fen_input.onkeyup = () => {
    update_input();
    render();
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
