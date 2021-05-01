function make_preset(name, size, value) {
    return `[Board "${name}"]\n[Mode "5D"]\n[Size "${size}"]\n${value.join("\n")}\n`;
}

const PRESETS = {
    "Standard": make_preset("Standard", "8x8", [
        "[r*nbqk*bnr*/p*p*p*p*p*p*p*p*/8/8/8/8/P*P*P*P*P*P*P*P*/R*NBQK*BNR*:0:1:w]",
    ]),
    "Standard - Turn Zero": make_preset("Standard", "8x8", [
        "[r*nbqk*bnr*/p*p*p*p*p*p*p*p*/8/8/8/8/P*P*P*P*P*P*P*P*/R*NBQK*BNR*:0:0:b]",
        "[r*nbqk*bnr*/p*p*p*p*p*p*p*p*/8/8/8/8/P*P*P*P*P*P*P*P*/R*NBQK*BNR*:0:1:w]",
    ]),
};
