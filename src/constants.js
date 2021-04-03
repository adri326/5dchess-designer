// Piece IDs
const PIECES = {
    BLANK: 0,
    W_PAWN: 1,
    W_KNIGHT: 2,
    W_BISHOP: 3,
    W_ROOK: 4,
    W_QUEEN: 5,
    W_KING: 6,
    W_UNICORN: 7,
    W_DRAGON: 8,
    W_PRINCESS: 9,
    W_BRAWN: 10,
    W_CKING: 11,
    W_RQUEEN: 12,

    B_PAWN: 33,
    B_KNIGHT: 34,
    B_BISHOP: 35,
    B_ROOK: 36,
    B_QUEEN: 37,
    B_KING: 38,
    B_UNICORN: 39,
    B_DRAGON: 40,
    B_PRINCESS: 41,
    B_BRAWN: 42,
    B_CKING: 43,
    B_RQUEEN: 44,

    MARKER: 99,

    B_OFFSET: 32,
};

// Piece assets
const PIECE_ASSETS = {
    [PIECES.W_PAWN]: "assets/pawn-white.svg",
    [PIECES.W_KNIGHT]: "assets/knight-white.svg",
    [PIECES.W_BISHOP]: "assets/bishop-white.svg",
    [PIECES.W_ROOK]: "assets/rook-white.svg",
    [PIECES.W_QUEEN]: "assets/queen-white.svg",
    [PIECES.W_KING]: "assets/king-white.svg",
    [PIECES.W_UNICORN]: "assets/unicorn-white.svg",
    [PIECES.W_DRAGON]: "assets/dragon-white.svg",
    [PIECES.W_PRINCESS]: "assets/princess-white.svg",
    [PIECES.W_BRAWN]: "assets/brawn-white.svg",
    [PIECES.W_CKING]: "assets/commonking-white.svg",
    [PIECES.W_RQUEEN]: "assets/royalqueen-white.svg",

    [PIECES.B_PAWN]: "assets/pawn-black.svg",
    [PIECES.B_KNIGHT]: "assets/knight-black.svg",
    [PIECES.B_BISHOP]: "assets/bishop-black.svg",
    [PIECES.B_ROOK]: "assets/rook-black.svg",
    [PIECES.B_QUEEN]: "assets/queen-black.svg",
    [PIECES.B_KING]: "assets/king-black.svg",
    [PIECES.B_UNICORN]: "assets/unicorn-black.svg",
    [PIECES.B_DRAGON]: "assets/dragon-black.svg",
    [PIECES.B_PRINCESS]: "assets/princess-black.svg",
    [PIECES.B_BRAWN]: "assets/brawn-black.svg",
    [PIECES.B_CKING]: "assets/commonking-black.svg",
    [PIECES.B_RQUEEN]: "assets/royalqueen-black.svg",
};

// Piece names
const PIECE_NAMES = {
    [PIECES.W_PAWN]: "White pawn",
    [PIECES.W_KNIGHT]: "White knight",
    [PIECES.W_BISHOP]: "White bishop",
    [PIECES.W_ROOK]: "White rook",
    [PIECES.W_QUEEN]: "White queen",
    [PIECES.W_KING]: "White king",
    [PIECES.W_UNICORN]: "White unicorn",
    [PIECES.W_DRAGON]: "White dragon",
    [PIECES.W_PRINCESS]: "White princess",
    [PIECES.W_BRAWN]: "White brawn",
    [PIECES.W_CKING]: "White common king",
    [PIECES.W_RQUEEN]: "White royal queen",

    [PIECES.B_PAWN]: "Black pawn",
    [PIECES.B_KNIGHT]: "Black knight",
    [PIECES.B_BISHOP]: "Black bishop",
    [PIECES.B_ROOK]: "Black rook",
    [PIECES.B_QUEEN]: "Black queen",
    [PIECES.B_KING]: "Black king",
    [PIECES.B_UNICORN]: "Black unicorn",
    [PIECES.B_DRAGON]: "Black dragon",
    [PIECES.B_PRINCESS]: "Black princess",
    [PIECES.B_BRAWN]: "Black brawn",
    [PIECES.B_CKING]: "Black common king",
    [PIECES.B_RQUEEN]: "Black royal queen",
};