(function () {
  const NOT_DOCUMENTED = "Not explicitly documented in the simulation files.";

  const deviceKinds = {
    R: { name: "Resistor", nodes: 2, purpose: "sets current, bias, gain, damping, or a time constant" },
    C: { name: "Capacitor", nodes: 2, purpose: "stores electric-field energy and introduces frequency-dependent impedance" },
    L: { name: "Inductor", nodes: 2, purpose: "stores magnetic-field energy and resists rapid current change" },
    V: { name: "Voltage source", nodes: 2, purpose: "defines a supply, bias, or stimulus" },
    I: { name: "Current source", nodes: 2, purpose: "defines a bias or stimulus current" },
    D: { name: "Diode", nodes: 2, purpose: "provides nonlinear, rectifying, limiting, or reference behavior" },
    Q: { name: "BJT", nodes: 3, purpose: "provides current-controlled transconductance or switching" },
    M: { name: "MOSFET", nodes: 4, purpose: "provides voltage-controlled transconductance or switching" },
    J: { name: "JFET", nodes: 3, purpose: "provides voltage-controlled channel conduction" },
    X: { name: "Subcircuit instance", nodes: null, purpose: "instantiates a reusable device-level macromodel" },
    U: { name: "Integrated-circuit symbol", nodes: null, purpose: "represents a modeled functional block" },
    S: { name: "Voltage-controlled switch", nodes: 4, purpose: "connects or isolates signal paths under control" },
    E: { name: "Voltage-controlled voltage source", nodes: 4, purpose: "models voltage gain or dependent behavior" },
    G: { name: "Voltage-controlled current source", nodes: 4, purpose: "models transconductance or dependent behavior" },
    F: { name: "Current-controlled current source", nodes: 2, purpose: "models dependent current gain" },
    H: { name: "Current-controlled voltage source", nodes: 2, purpose: "models dependent transresistance" },
    B: { name: "Behavioral source", nodes: 2, purpose: "defines an equation-controlled stimulus or response" },
    K: { name: "Mutual inductance", nodes: 0, purpose: "couples named inductors magnetically" }
  };

  const profiles = {
    rc: {
      prerequisite: "Ohm's law, capacitor charge, impedance, and first-order differential equations.",
      question: "How do resistance, capacitance, stimulus shape, and observation time determine the node response?",
      flow: ["Identify the driven node", "Trace the resistive path", "Locate stored charge", "Predict the time or frequency response", "Compare the plotted nodes"],
      principle: "A resistor converts voltage difference into current, while a capacitor integrates that current as stored charge. The same network therefore has both a time-domain constant and a frequency-domain transfer function.",
      equations: [
        ["Constitutive laws", "i_R = v_R / R; i_C = C dv_C/dt", "Relates branch voltage and current."],
        ["Time constant", "tau = R_eq C", "Uses the resistance seen by the capacitor with independent sources suppressed."],
        ["Single-pole cutoff", "f_c = 1 / (2 pi R_eq C)", "Applies only when the topology reduces to one dominant RC pole."]
      ],
      misconception: "A capacitor is not always an open circuit. That approximation applies to DC steady state, not to switching edges or AC analysis.",
      vlsi: "RC delay appears in interconnect, gate loading, clock distribution, compensation, and bandwidth estimation throughout integrated-circuit design."
    },
    inductive: {
      prerequisite: "Ohm's law, Faraday's law, current continuity, and stored energy.",
      question: "What voltage is required to change inductor current at the rate demanded by the source?",
      flow: ["Identify the applied voltage", "Choose the current reference", "Apply v = L di/dt", "Check switching intervals", "Inspect current continuity"],
      principle: "An inductor converts applied voltage into a rate of current change and stores energy in a magnetic field.",
      equations: [
        ["Inductor law", "v_L = L di_L/dt", "Predicts the current slope during each constant-voltage interval."],
        ["Stored energy", "E_L = 0.5 L i_L^2", "Connects current to magnetic energy." ]
      ],
      misconception: "Inductor current cannot jump instantaneously, but inductor voltage can.",
      vlsi: "On-chip inductors, package inductance, bond wires, and power-delivery networks make this behavior relevant to RF ICs and switching regulators."
    },
    bjt: {
      prerequisite: "PN-junction bias, KCL, transistor operating regions, and small-signal gain.",
      question: "Which bias conditions establish the operating region, and how is a small input converted into output current or voltage?",
      flow: ["Establish supply and bias", "Check base-emitter drive", "Determine transistor region", "Trace collector and emitter currents", "Evaluate gain and headroom"],
      principle: "A BJT uses base-emitter junction bias to control collector current; surrounding impedances convert that current into voltage gain, buffering, mirroring, or power delivery.",
      equations: [
        ["Active-region estimate", "I_C approximately beta I_B", "A first check only; beta varies with device and operating point."],
        ["Transconductance", "g_m = I_C / V_T", "Links DC bias current to small-signal gain near the operating point."],
        ["Voltage gain estimate", "A_v approximately -g_m R_load", "Requires active-region bias and the effective small-signal load." ]
      ],
      misconception: "A transistor model name does not guarantee a fixed beta or a fixed 0.7 V base-emitter drop.",
      vlsi: "Bipolar stages remain important in bandgaps, references, high-speed interfaces, BiCMOS signal paths, and precision analog blocks."
    },
    mos: {
      prerequisite: "MOS terminal voltages, cutoff/triode/saturation regions, and capacitance.",
      question: "How do gate voltage, drain voltage, device sizing, and load determine current and switching behavior?",
      flow: ["Identify gate stimulus", "Check source and body references", "Determine operating region", "Trace drain current", "Inspect output swing and timing"],
      principle: "A MOSFET controls channel current through electric field at the gate; topology and bias decide whether that control is used for switching or amplification.",
      equations: [
        ["Overdrive", "V_OV = V_GS - V_TH", "Provides a first indication of channel strength when the device is on."],
        ["Long-channel saturation", "I_D approximately 0.5 mu C_ox (W/L) V_OV^2", "A teaching estimate; the LTspice model can include many nonideal effects."],
        ["Dynamic energy", "E approximately C_load V_DD^2", "First-order energy drawn for a complete charge/discharge event." ]
      ],
      misconception: "MOS saturation is the analog constant-current region; it is not the same meaning as BJT saturation.",
      vlsi: "MOS operating regions, sizing, capacitance, and switching energy are the basis of CMOS logic and analog integrated circuits."
    },
    opamp: {
      prerequisite: "Negative feedback, differential inputs, ideal op-amp rules, and finite gain-bandwidth.",
      question: "What feedback path sets the intended closed-loop behavior, and which device limits make the result depart from the ideal model?",
      flow: ["Identify both inputs", "Trace negative and positive feedback", "Derive the ideal transfer", "Check rails and common-mode range", "Compare transient or AC behavior"],
      principle: "Large differential gain combined with feedback makes a circuit realize a transfer function, but supply range, bandwidth, slew rate, offset, and output drive remain finite.",
      equations: [
        ["Inverting gain", "A_v = -R_f / R_in", "Valid for the standard inverting topology under linear negative feedback."],
        ["Non-inverting gain", "A_v = 1 + R_f / R_g", "Valid for the standard non-inverting topology under linear negative feedback."],
        ["Closed-loop bandwidth", "BW approximately GBW / noise gain", "A first-order estimate for a dominant-pole op amp." ]
      ],
      misconception: "The virtual short is a consequence of linear negative feedback; it is not valid when the amplifier saturates or lacks feedback.",
      vlsi: "Op-amp topologies map directly to transistor-level gain stages, compensation, common-mode control, and output-stage design."
    },
    oscillator: {
      prerequisite: "Feedback, poles and phase, transient startup, and resonant or relaxation timing.",
      question: "Which network selects frequency, and what nonlinear mechanism prevents amplitude from growing without bound?",
      flow: ["Find the frequency-selective path", "Trace positive feedback", "Check loop gain at startup", "Identify amplitude limiting", "Measure settled period and amplitude"],
      principle: "Oscillation requires a frequency where loop phase is effectively zero and startup loop gain exceeds unity; nonlinearity later reduces the effective gain.",
      equations: [
        ["LC resonance", "f_0 = 1 / (2 pi sqrt(LC))", "First-order resonance before device and parasitic loading."],
        ["Wien frequency", "f_0 = 1 / (2 pi RC)", "Applies to the equal-R, equal-C Wien network."],
        ["Startup condition", "|A beta| > 1 initially", "Small disturbances must grow before amplitude stabilization." ]
      ],
      misconception: "A correct nominal resonant frequency does not prove startup; loop gain, phase, initial conditions, and losses also matter.",
      vlsi: "Integrated oscillators supply clocks and local oscillators; phase noise, startup margin, tuning range, and power become central design constraints."
    },
    power: {
      prerequisite: "Switching states, energy conservation, diode/MOSFET conduction, and averaged waveforms.",
      question: "Where does energy flow in each switching state, and which component or model limits the ideal conversion?",
      flow: ["Identify input and return", "Separate switching states", "Trace inductor or transformer energy", "Locate rectification and filtering", "Check stress, ripple, and regulation"],
      principle: "Power converters move energy through switched reactive elements; interfaces and protection circuits shape or interrupt that flow under defined conditions.",
      equations: [
        ["Inductor balance", "average(v_L) = 0 in periodic steady state", "Forms the basis of ideal conversion-ratio derivations."],
        ["Capacitor balance", "average(i_C) = 0 in periodic steady state", "Connects load current, duty cycle, and ripple."],
        ["Power check", "P_out <= P_in", "Lossless equality is an estimate, not a device-level simulation result." ]
      ],
      misconception: "An ideal duty-cycle ratio is not a prediction of regulated output when switch loss, diode drop, winding resistance, control limits, and loading are modeled.",
      vlsi: "Power-management ICs integrate control, gate drive, sensing, protection, references, and layout-sensitive high-current paths."
    },
    mixed: {
      prerequisite: "Sampling or modulation fundamentals, signal-chain blocks, and time/frequency-domain interpretation.",
      question: "How does information move between continuous-time, switched, digital, or RF representations in this model?",
      flow: ["Define the information-bearing input", "Partition functional blocks", "Track state or spectrum changes", "Identify the measured output", "Check timing and interface assumptions"],
      principle: "Mixed-signal systems are best understood as connected transformations, with each block carrying assumptions about amplitude, timing, bandwidth, and loading.",
      equations: [
        ["Sampling reference", "f_s > 2 f_max", "A necessary ideal condition for avoiding aliasing of a band-limited input."],
        ["Signal-chain gain", "A_total = product(A_stage)", "Applies to cascaded linear gains when loading is negligible."],
        ["Noise power", "uncorrelated noise powers add", "Explains why each stage's bandwidth and gain matter." ]
      ],
      misconception: "A clean transient trace at one input condition does not establish bandwidth, stability, noise, or robustness.",
      vlsi: "Modern SoCs depend on analog front ends, data converters, clocks, references, RF interfaces, and protection around digital processing."
    }
  };

  const verifiedReferences = {
    AD8542: { title: "AD8542 official product page", url: "https://www.analog.com/en/products/ad8542.html", parameters: "Supply range, input/output range, bandwidth, input current, and stability." },
    ADG1633: { title: "ADG1633 official product page", url: "https://www.analog.com/en/products/adg1633.html", parameters: "On resistance, supply range, current, logic levels, and switching behavior." },
    LT1001: { title: "LT1001 official product page", url: "https://www.analog.com/en/products/lt1001.html", parameters: "Offset, drift, bias current, CMRR, PSRR, noise, and supply conditions." },
    LT1009: { title: "LT1009 official product page", url: "https://www.analog.com/en/products/lt1009.html", parameters: "Reference voltage, operating current, dynamic impedance, noise, and temperature behavior." },
    LT1017: { title: "LT1017 official product page", url: "https://www.analog.com/en/products/lt1017.html", parameters: "Supply range, input common-mode range, offset, propagation delay, and output stage." },
    LT1225: { title: "LT1225 official product page", url: "https://www.analog.com/en/products/lt1225.html", parameters: "Bandwidth, slew rate, supply range, input range, noise, and output drive." },
    LT1493: { title: "LT1493 official product page", url: "https://www.analog.com/en/products/lt1493.html", parameters: "Supply range, input/output range, offset, bandwidth, and supply current." },
    LT1498: { title: "LT1498 official product page", url: "https://www.analog.com/en/products/lt1498.html", parameters: "Supply range, rail-to-rail behavior, bandwidth, slew rate, and output drive." },
    LT1711: { title: "LT1711 official product page", url: "https://www.analog.com/en/products/lt1711.html", parameters: "Input range, propagation delay, output type, hysteresis, and supply range." },
    LT6016: { title: "LT6016 official product page", url: "https://www.analog.com/en/products/lt6016.html", parameters: "Input common-mode range, offset, bias current, supply range, and bandwidth." },
    LT8316: { title: "LT8316 official product page", url: "https://www.analog.com/en/products/lt8316.html", parameters: "Input range, switching limits, regulation method, current sensing, and isolation application constraints." },
    LTC6247: { title: "LTC6247 official product page", url: "https://www.analog.com/en/products/ltc6247.html", parameters: "Input noise, bias current, bandwidth, slew rate, supply range, and output swing." },
    LTC7138: { title: "LTC7138 official product page", url: "https://www.analog.com/en/products/ltc7138.html", parameters: "Input range, output current, switching behavior, feedback limits, and protection features." },
    LT8330: { title: "LT8330 official product page", url: "https://www.analog.com/en/products/lt8330.html", parameters: "Input range, switch rating, frequency, current limit, feedback, and efficiency conditions." },
    OP07: { title: "OP07 official product page", url: "https://www.analog.com/en/products/op07.html", parameters: "Offset, drift, bias current, noise, supply range, output swing, and stability." }
  };

  const exactCalculations = {
    "intro-rc-pulse": [
      ["Time constant", "tau = RC", "(3.3 kOhm)(1000 fF)", "3.3 ns"],
      ["Single-pole cutoff", "f_c = 1/(2 pi RC)", "1/(2 pi x 3.3 ns)", "48.2 MHz"],
      ["10-90% rise estimate", "t_r approximately 2.2 tau", "2.2 x 3.3 ns", "7.26 ns"]
    ],
    "capacitor-characterization": [
      ["Stored energy at 1.8 V", "E = 0.5 CV^2", "0.5 x 10 fF x (1.8 V)^2", "16.2 fJ"]
    ],
    "inductor-transient": [
      ["Ideal current slope", "di/dt = V/L", "1.8 V / 1 mH", "1.8 kA/s"],
      ["Current change in 50 ns", "Delta i = (V/L) Delta t", "1.8 kA/s x 50 ns", "90 uA"]
    ],
    "rc-transient-family": [
      ["Pulse-case time constant", "tau = RC", "1 kOhm x 4000 fF", "4 ns"],
      ["Sine-case time constant", "tau = RC", "1 kOhm x 50 nF", "50 us"],
      ["Sine-case cutoff", "f_c = 1/(2 pi RC)", "1/(2 pi x 50 us)", "3.18 kHz"]
    ],
    "rc-dc-netlist": [
      ["Associated transient time constant", "tau = RC", "1 kOhm x 10 fF", "10 ps; the configured DC sweep does not show this transient"]
    ],
    "series-parallel-rc": [
      ["Recorded equivalent resistance", "R_eq = R1 + R2 + R3", "1 kOhm + 1 kOhm + 1 kOhm", "3 kOhm"],
      ["Recorded equivalent capacitance", "C_eq = C1 + C2 + C3", "10 fF + 10 fF + 10 fF", "30 fF"],
      ["Lumped first-order estimate", "tau = R_eq C_eq", "3 kOhm x 30 fF", "90 ps; distributed nodes can have different responses"]
    ],
    "wein-bridge": [
      ["80 kOhm / 10 nF variant", "f_0 = 1/(2 pi RC)", "1/(2 pi x 80 kOhm x 10 nF)", "199 Hz"],
      ["51 kOhm / 1 nF variant", "f_0 = 1/(2 pi RC)", "1/(2 pi x 51 kOhm x 1 nF)", "3.12 kHz"]
    ],
    "crystal-16mhz": [
      ["Motional-series resonance", "f_s = 1/(2 pi sqrt(L_m C_m))", "L_m = 19.8 mH, C_m = 4.9 fF", "16.2 MHz before shunt/load effects"]
    ],
    "lc-5ghz": [
      ["Ideal single-tank estimate", "f_0 = 1/(2 pi sqrt(LC))", "L = 1.56 nH, C = 600 fF", "5.20 GHz before device and layout parasitics"]
    ]
  };

  function chooseProfile(project) {
    const terms = `${project.title} ${project.concepts.join(" ")}`.toLowerCase();
    if (/\brc\b|capacitor|resistor/.test(terms) && project.category === "Circuit Fundamentals") return profiles.rc;
    if (/inductor/.test(terms) && project.category === "Circuit Fundamentals") return profiles.inductive;
    if (project.category === "Semiconductor Devices") return /mos|cmos/.test(terms) ? profiles.mos : profiles.bjt;
    if (project.id === "internal-opamp") return profiles.bjt;
    if (["gain-boosted-opamp", "folded-cascode", "telescopic-cascode"].includes(project.id)) return profiles.mos;
    if (["function-generator", "three-phase-oscillator"].includes(project.id)) return profiles.oscillator;
    if (["chopper-amplifier", "sample-hold", "optocoupler-isolation"].includes(project.id)) return profiles.mixed;
    if (["class-e-rf-amplifier", "power-amplifier-comparison"].includes(project.id)) return profiles.power;
    if (project.id === "lm741-pspice") return profiles.opamp;
    if (project.category === "BJT & Amplifiers") return profiles.bjt;
    if (project.category === "Op-Amps & IC Design") return profiles.opamp;
    if (project.category === "Oscillators & Waveforms") return profiles.oscillator;
    if (project.category === "Power & Interfaces") return profiles.power;
    if (project.category === "Mixed-Signal & RF") return profiles.mixed;
    return profiles.rc;
  }

  function parseStatement(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("*")) return null;
    if (trimmed.startsWith(".")) {
      return { kind: "Directive", designator: trimmed.split(/\s+/)[0], nodes: "--", definition: trimmed, raw: trimmed };
    }

    const tokens = trimmed.split(/\s+/);
    const designator = tokens[0];
    const prefix = designator.charAt(0).toUpperCase();
    const kind = deviceKinds[prefix];
    if (!kind) return { kind: "Netlist statement", designator, nodes: NOT_DOCUMENTED, definition: trimmed, raw: trimmed };

    let nodeCount = kind.nodes;
    if (prefix === "Q") nodeCount = tokens.length >= 6 ? 4 : 3;
    if (prefix === "X" || prefix === "U") nodeCount = Math.max(0, tokens.length - 2);
    const nodes = nodeCount ? tokens.slice(1, 1 + nodeCount).join(", ") : "--";
    const definition = tokens.slice(1 + nodeCount).join(" ") || NOT_DOCUMENTED;
    return { kind: kind.name, designator, nodes, definition, raw: trimmed, purpose: kind.purpose };
  }

  function explainDirective(line) {
    const directive = line.trim().split(/\s+/)[0].toLowerCase();
    const explanations = {
      ".op": "solves one nonlinear DC operating point",
      ".dc": "repeats DC operating-point solutions while sweeping a source or parameter",
      ".ac": "linearizes the circuit at its operating point and sweeps small-signal frequency",
      ".tran": "solves the nonlinear circuit as a function of time",
      ".model": "defines compact-model parameters for a device name",
      ".lib": "loads model definitions from a library",
      ".include": "inserts another SPICE text file",
      ".subckt": "starts a reusable subcircuit definition",
      ".ends": "ends a subcircuit definition",
      ".param": "defines a reusable parameter",
      ".step": "repeats an analysis over parameter values",
      ".meas": "requests a numerical measurement from an analysis",
      ".print": "requests listed numerical outputs",
      ".backanno": "retains schematic annotation information",
      ".end": "marks the end of the netlist"
    };
    return explanations[directive] || "controls a SPICE model, option, output, or analysis";
  }

  function explainStatement(statement) {
    if (statement.kind === "Directive") return `${statement.designator} ${explainDirective(statement.raw)}.`;
    if (statement.purpose) return `${statement.designator} is a ${statement.kind.toLowerCase()} connected through the listed node sequence; it ${statement.purpose}.`;
    return `${statement.designator} is preserved exactly because its syntax is not safely reducible from the available evidence.`;
  }

  function findReferences(project, statements) {
    const evidence = `${JSON.stringify(project.components)} ${statements.map((statement) => statement.raw).join(" ")}`;
    return Object.entries(verifiedReferences)
      .filter(([part]) => new RegExp(`\\b${part}\\b`, "i").test(evidence))
      .map(([part, reference]) => ({ part, ...reference }));
  }

  function componentLessons(project) {
    return project.components.map((component) => {
      const prefixMatch = component.name.match(/\b([RCLVIDQMJXUS])\d/i);
      const kind = prefixMatch ? deviceKinds[prefixMatch[1].toUpperCase()] : null;
      return {
        name: component.name,
        value: component.value,
        what: kind ? kind.name : "Recorded circuit element or group",
        why: kind ? `It ${kind.purpose}.` : "Its project-specific role must be established from the schematic and connectivity.",
        change: kind
          ? `Change its value or model, then test how its role in the circuit changes. Re-run the same analysis and compare the same nodes.`
          : "Change one recorded parameter at a time and compare against the original analysis."
      };
    });
  }

  function buildLesson(project, netlist) {
    const profile = chooseProfile(project);
    const netlistText = netlist && netlist.text ? netlist.text : "";
    const statements = netlistText.split(/\r?\n/).map(parseStatement).filter(Boolean);
    const elementStatements = statements.filter((statement) => statement.kind !== "Directive");
    const directiveStatements = statements.filter((statement) => statement.kind === "Directive");
    const calculations = (exactCalculations[project.id] || []).map(([label, formula, substitution, result]) => ({ label, formula, substitution, result }));
    const comparison = [
      { aspect: "Qualitative behavior", theory: project.interpretation, simulation: project.observe, difference: "Use the plotted traces to test whether the predicted direction, region, timing, or spectral trend occurs." },
      { aspect: "Numerical result", theory: calculations.length ? calculations.map((item) => `${item.label}: ${item.result}`).join("; ") : NOT_DOCUMENTED, simulation: NOT_DOCUMENTED, difference: "A numerical error or percent difference cannot be reported until waveform measurements are exported or recorded." },
      { aspect: "Model limits", theory: "The equations are first-order engineering models with stated assumptions.", simulation: netlist ? netlist.confidence : NOT_DOCUMENTED, difference: "Any remaining difference can come from device models, loading, parasitics, timestep, initial conditions, or an invalid theoretical assumption." }
    ];

    return {
      prerequisite: profile.prerequisite,
      question: profile.question,
      flow: profile.flow,
      principle: profile.principle,
      equations: profile.equations.map(([name, equation, use]) => ({ name, equation, use })),
      componentLessons: componentLessons(project),
      netlist: netlist || { status: "Unavailable", source: "", method: NOT_DOCUMENTED, confidence: NOT_DOCUMENTED, text: "" },
      statements,
      elementStatements,
      directiveStatements,
      calculations,
      expected: project.interpretation,
      waveform: project.observe,
      comparison,
      experiments: project.questions,
      misconception: profile.misconception,
      vlsi: profile.vlsi,
      references: findReferences(project, statements),
      remember: [
        project.outcome,
        `The representative netlist is tied to ${netlist && netlist.source ? netlist.source : "an unavailable source"}; grouped project files can contain different values or topology.`,
        calculations.length ? "Treat each hand calculation as an estimate with the displayed assumptions." : "No numerical hand result is asserted without enough topology and value evidence.",
        "A waveform is evidence only after its node, axis, analysis setup, and measurement method are identified."
      ],
      selfCheck: [
        `Which recorded component or modeled block most strongly controls the behavior in ${project.title}?`,
        "Which netlist tokens are element names, nodes, values or models, and analysis directives?",
        "What single parameter would you change first, and what directional change do you predict before simulation?",
        "Which LTspice measurement would make the theory-versus-simulation comparison quantitative?"
      ]
    };
  }

  window.ltspiceTeaching = { buildLesson, NOT_DOCUMENTED, explainStatement };
}());