class Piece {
    constructor(id, moved) {
        this.id = id;
        this.moved = moved;
    }
}

function parse(raw) {
    let matched = raw.match(/\[([^\]]+)\]/g).map(x => /^\[([^\]]+)\]/.exec(x)[1]);
    let metadata = {
        size: "8x8",
    };
    let res = {};
    let fens = [];
    for (let match of matched) {
        let match_again = /^\s*(\w+)\s+"([^\"]+)"\s*$/.exec(match);
        if (match_again) {
            metadata[match_again[1].toLowerCase()] = match_again[2];
            continue;
        }
        match_again = /^([a-zA-Z0-9*+/]+):([+-]?\d+):(\d+):([wb])$/.exec(match);
        if (match_again) {
            let l = +match_again[2];
            let t = (+match_again[3] - 1) * 2 + (match_again[4] === "w" ? 0 : 1);
            let coords = l + ":" + t;
            fens.push([coords, match_again[1]]);
            continue
        }
        return new Error(`Unrecognized header: ${match}`);
    }
    let [width, height] = metadata.size.split("x").map(x => +x);
    for (let [coords, fen] of fens) {
        let split = fen.split("/");
        let board = [];
        if (split.length !== height) return new Error(`5DFEN dimensions do not match: '${fen}'`);
        for (let raw_row of split) {
            let row = [];
            let raw = raw_row;
            while (raw.length) {
                raw = raw.trim();
                let match_number = /^(\d+)/.exec(raw);
                if (match_number) {
                    raw = raw.slice(match_number[0].length);
                    for (let x = 0; x < +match_number[1]; x++) {
                        row.push(null);
                    }
                    continue
                }
                let white = raw[0].toUpperCase() === raw[0];
                switch (raw[0]) {
                    case 'p':
                    case 'P':
                        row.push(new Piece(PIECES.W_PAWN + white * PIECES.B_OFFSET, true));
                        break;

                    case 'r':
                    case 'R':
                        row.push(new Piece(PIECES.W_ROOK + white * PIECES.B_OFFSET, true));
                        break;

                    case 'b':
                    case 'B':
                        row.push(new Piece(PIECES.W_BISHOP + white * PIECES.B_OFFSET, true));
                        break;

                    case 'r':
                    case 'R':
                        row.push(new Piece(PIECES.W_ROOK + white * PIECES.B_OFFSET, true));
                        break;

                    case 'n':
                    case 'N':
                        row.push(new Piece(PIECES.W_KNIGHT + white * PIECES.B_OFFSET, true));
                        break;

                    case 'k':
                    case 'K':
                        row.push(new Piece(PIECES.W_KING + white * PIECES.B_OFFSET, true));
                        break;

                    case 'u':
                    case 'U':
                        row.push(new Piece(PIECES.W_UNICORN + white * PIECES.B_OFFSET, true));
                        break;

                    case 'd':
                    case 'D':
                        row.push(new Piece(PIECES.W_DRAGON + white * PIECES.B_OFFSET, true));
                        break;

                    case 's':
                    case 'S':
                        row.push(new Piece(PIECES.W_PRINCESS + white * PIECES.B_OFFSET, true));
                        break;

                    case 'w':
                    case 'W':
                        row.push(new Piece(PIECES.W_BRAWN + white * PIECES.B_OFFSET, true));
                        break;

                    case 'c':
                    case 'C':
                        row.push(new Piece(PIECES.W_COMMON_KING + white * PIECES.B_OFFSET, true));
                        break;

                    case 'q':
                    case 'Q':
                        if (raw[1] === "+") {
                            row.push(new Piece(PIECES.W_ROYAL_QUEEN + white * PIECES.B_OFFSET, true));
                            raw = raw.slice(1);
                        } else {
                            row.push(new Piece(PIECES.W_QUEEN + white * PIECES.B_OFFSET, true));
                        }

                        break;
                    case '+':
                        return new Error(`Invalid 5DFEN: unexpected '+': '${raw}`);
                    case '*':
                        if (row.length === 0) {
                            return new Error(`Invalid 5DFEN: unexpected '*' at start of row: '${raw}`);
                        } else {
                            row[row.length - 1].moved = false;
                            break
                        }
                }
                raw = raw.slice(1);
            }

            if (row.length !== width) return new Error(`5DFEN dimensions do not match: '${raw_row}'`);
            board.push(row);
        }
        res[coords] = board;
    }
    return res;
}
