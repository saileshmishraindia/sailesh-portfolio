(function () {
  "use strict";

  const menuToggle = document.getElementById("academyMenuToggle");
  const nav = document.getElementById("academyNav");
  const modeToggle = document.getElementById("academyModeToggle");

  function closeMenu() {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.querySelector("i").className = "fas fa-bars";
  }

  if (menuToggle && nav) {
    nav.classList.add("enhanced");
    menuToggle.hidden = false;
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      menuToggle.querySelector("i").className = open ? "fas fa-xmark" : "fas fa-bars";
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeMenu();
        menuToggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    window.matchMedia("(max-width: 1000px)").addEventListener("change", closeMenu);
  }

  if (modeToggle) {
    modeToggle.hidden = false;
    modeToggle.addEventListener("click", () => {
      const dark = document.body.classList.toggle("dark-mode");
      modeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      modeToggle.setAttribute("aria-pressed", String(dark));
      modeToggle.querySelector("i").className = dark ? "fas fa-sun" : "fas fa-moon";
    });
  }

  const departments = [
    { id: "vlsi", title: "Semiconductor Technology & VLSI" },
    { id: "pcb", title: "PCB Design & Electronic Design Automation" },
    { id: "programming", title: "Programming & Engineering Automation" },
    { id: "digital", title: "Digital Electronics & Computer Engineering" },
    { id: "electronics", title: "Electronics & Instrumentation" },
    { id: "ai", title: "Artificial Intelligence in Engineering" }
  ];

  // Planning estimates only. Add catalogue entries here; no enrolment service is enabled.
  const courses = [
    {
      id: "vlsi-devices", department: "vlsi", title: "Semiconductor & CMOS Fundamentals", level: "Foundation", duration: "24 learning hours", status: "In Development",
      description: "Connect semiconductor physics, device operating regions and CMOS technology to circuit behaviour.",
      prerequisites: "School-level algebra, basic electricity and an interest in electronic devices.",
      outcomes: ["Explain PN junction and MOS device behaviour.", "Relate CMOS fabrication and inverter characteristics to circuit operation."],
      practical: "Plot device curves and simulate a CMOS inverter; compare predictions with results.",
      assessment: "Concept questions, annotated simulation results and a short technical explanation."
    },
    {
      id: "vlsi-analog", department: "vlsi", title: "Analog IC Design Foundations", level: "Intermediate", duration: "36 learning hours", status: "Coming Soon",
      description: "Explore biasing, small-signal models, gain, headroom and feedback in MOS amplifier stages.",
      prerequisites: "MOS operating regions, circuit analysis and basic AC analysis.",
      outcomes: ["Estimate bias points and small-signal gain.", "Evaluate gain, bandwidth and output-swing trade-offs."],
      practical: "Design and simulate a common-source stage with a documented bias and frequency-response study.",
      assessment: "Design calculations, simulation assignments and a reviewed amplifier report."
    },
    {
      id: "vlsi-digital", department: "vlsi", title: "Digital IC Design Fundamentals", level: "Intermediate", duration: "30 learning hours", status: "Coming Soon",
      description: "Study transistor-level logic, delay, loading and switching power.",
      prerequisites: "CMOS inverter operation, Boolean logic and RC fundamentals.",
      outcomes: ["Explain static CMOS gate structures.", "Compare delay and power under different loading conditions."],
      practical: "Simulate a small gate chain and characterise propagation delay and load sensitivity.",
      assessment: "Gate analysis tasks, measurement evidence and a design comparison."
    },
    {
      id: "vlsi-rtl", department: "vlsi", title: "RTL Design Fundamentals", level: "Intermediate", duration: "32 learning hours", status: "In Development",
      description: "Translate combinational and sequential specifications into readable, synthesizable RTL.",
      prerequisites: "Digital logic, flip-flops, finite-state machines and basic programming.",
      outcomes: ["Write structured Verilog modules.", "Explain reset, clocking and simulation behaviour."],
      practical: "Implement a counter and a small controller with self-checking tests.",
      assessment: "RTL exercises, simulation tests and a controller project review."
    },
    {
      id: "vlsi-verification", department: "vlsi", title: "Functional Verification Foundations", level: "Intermediate", duration: "32 learning hours", status: "Coming Soon",
      description: "Build specification-driven test plans and meaningful evidence of functional correctness.",
      prerequisites: "RTL design, simulation and introductory SystemVerilog syntax.",
      outcomes: ["Derive test scenarios from a specification.", "Distinguish assertions, functional coverage and code coverage."],
      practical: "Create a self-checking testbench and a coverage-oriented test plan for a FIFO.",
      assessment: "Test plan, testbench results, bug analysis and verification report."
    },
    {
      id: "vlsi-physical", department: "vlsi", title: "Physical Design Fundamentals", level: "Intermediate", duration: "28 learning hours", status: "Coming Soon",
      description: "Understand how a netlist becomes a placed and routed design under physical constraints.",
      prerequisites: "Digital IC concepts, timing basics and the RTL-to-netlist flow.",
      outcomes: ["Explain floorplanning, placement, clocking and routing.", "Interpret introductory timing and congestion reports."],
      practical: "Analyse a small educational design flow and document constraint trade-offs.",
      assessment: "Flow quizzes, report interpretation and a physical-design case study."
    },
    {
      id: "pcb-foundations", department: "pcb", title: "PCB Fundamentals & Schematic Capture", level: "Foundation", duration: "24 learning hours", status: "In Development",
      description: "Develop a reviewable schematic and component library before beginning board layout.",
      prerequisites: "Basic electronic components, circuit diagrams and computer file management.",
      outcomes: ["Create symbols and map them to verified footprints.", "Check connectivity and document component intent."],
      practical: "Capture a small sensor-interface schematic with a component-library checklist.",
      assessment: "Schematic review, electrical checks and a library-validation exercise."
    },
    {
      id: "pcb-layout", department: "pcb", title: "PCB Layout, Routing & EDA Workflows", level: "Intermediate", duration: "30 learning hours", status: "Coming Soon",
      description: "Translate a schematic into an inspectable board with design-rule checks and fabrication outputs.",
      prerequisites: "Schematic capture, footprint mapping and PCB fundamentals.",
      outcomes: ["Plan placement and route a two-layer educational board.", "Resolve design-rule issues and review fabrication outputs."],
      practical: "Complete a low-voltage board layout, run DRC and prepare a review package; no fabrication required.",
      assessment: "Placement review, DRC evidence and a final board-design report."
    },
    {
      id: "pcb-integrity", department: "pcb", title: "Signal & Power Integrity Fundamentals", level: "Intermediate", duration: "24 learning hours", status: "Coming Soon",
      description: "Reason about return paths, coupling, decoupling and interconnect behaviour.",
      prerequisites: "PCB layout, AC circuit analysis and introductory transmission-line concepts.",
      outcomes: ["Identify discontinuities and return-path problems.", "Explain power-delivery impedance and decoupling trade-offs."],
      practical: "Compare simulated interconnect and decoupling cases with an annotated layout review.",
      assessment: "Scenario questions, simulation evidence and an integrity review."
    },
    {
      id: "python-foundations", department: "programming", title: "Python Programming for Engineers", level: "Foundation", duration: "30 learning hours", status: "In Development",
      description: "Learn programming through units, calculations, structured data and engineering test cases.",
      prerequisites: "School-level mathematics and basic computer use; no prior coding required.",
      outcomes: ["Write functions and process structured files.", "Validate numerical results with tests and explicit units."],
      practical: "Build a circuit-calculation utility and a measurement-data summary script.",
      assessment: "Coding exercises, automated tests and a documented engineering utility."
    },
    {
      id: "automation-workflows", department: "programming", title: "Shell Scripting & Engineering Workflow Automation", level: "Intermediate", duration: "24 learning hours", status: "Coming Soon",
      description: "Automate repeatable data-processing and tool workflows with clear failure reporting.",
      prerequisites: "Basic Python, file systems and command-line familiarity.",
      outcomes: ["Compose repeatable batch workflows.", "Parse logs and produce traceable engineering summaries."],
      practical: "Create a dry-run-capable workflow for organising simulation outputs and extracting measurements.",
      assessment: "Script tests, failure-handling exercises and a reproducibility review."
    },
    {
      id: "gui-automation", department: "programming", title: "Responsible GUI Automation", level: "Intermediate", duration: "20 learning hours", status: "Coming Soon",
      description: "Plan robust automation for authorised desktop workflows without relying on fragile clicks.",
      prerequisites: "Python programming and basic testing concepts.",
      outcomes: ["Choose suitable automation interfaces.", "Design observable steps, timeouts and safe stop conditions."],
      practical: "Automate a local demonstration application using synthetic data and explicit user control.",
      assessment: "Automation script, recovery tests and a limitations report."
    },
    {
      id: "digital-logic", department: "digital", title: "Digital Logic & Combinational Design", level: "Foundation", duration: "24 learning hours", status: "In Development",
      description: "Progress from Boolean algebra to adders, multiplexers and combinational datapaths.",
      prerequisites: "School-level algebra and binary-number basics.",
      outcomes: ["Derive and simplify logic expressions.", "Validate combinational circuits against truth tables."],
      practical: "Build and test an adder, decoder and a small arithmetic logic unit in simulation.",
      assessment: "Logic problems, exhaustive test cases and a combinational design task."
    },
    {
      id: "digital-sequential", department: "digital", title: "Sequential Circuits, Registers & Memories", level: "Intermediate", duration: "28 learning hours", status: "Coming Soon",
      description: "Explore state, timing, flip-flops, registers, counters and memory organisation.",
      prerequisites: "Combinational logic and binary arithmetic.",
      outcomes: ["Design counters and finite-state machines.", "Explain timing assumptions and basic memory interfaces."],
      practical: "Simulate a register bank and a finite-state controller with reset and boundary tests.",
      assessment: "Timing exercises, state-machine implementation and simulation review."
    },
    {
      id: "computer-architecture", department: "digital", title: "Computer Architecture & Processor Fundamentals", level: "Intermediate", duration: "32 learning hours", status: "Coming Soon",
      description: "Connect instructions, datapaths, control, memory hierarchy and performance reasoning.",
      prerequisites: "Digital logic, registers, binary arithmetic and introductory programming.",
      outcomes: ["Trace an instruction through a simple processor.", "Explain memory hierarchy and basic pipeline hazards."],
      practical: "Model a small instruction sequence and analyse a simplified processor datapath.",
      assessment: "Architecture questions, execution traces and a processor-model report."
    },
    {
      id: "electronics-circuits", department: "electronics", title: "Circuit Analysis & Semiconductor Devices", level: "Foundation", duration: "28 learning hours", status: "In Development",
      description: "Use circuit laws and device models to explain DC and transient behaviour.",
      prerequisites: "Algebra and elementary electricity.",
      outcomes: ["Apply KCL and KVL with consistent signs and units.", "Interpret diode, BJT and MOS operating conditions."],
      practical: "Compare hand calculations with low-voltage RC and device simulations.",
      assessment: "Worked analysis, simulation records and a device-characterisation task."
    },
    {
      id: "electronics-opamp", department: "electronics", title: "Analog Electronics & Operational Amplifiers", level: "Intermediate", duration: "28 learning hours", status: "Coming Soon",
      description: "Develop feedback-based amplifier circuits while accounting for non-ideal behaviour.",
      prerequisites: "Circuit analysis, AC response and semiconductor-device basics.",
      outcomes: ["Analyse closed-loop gain and bandwidth.", "Recognise saturation, input-range and stability limitations."],
      practical: "Simulate an active filter or sensor-conditioning stage and document non-ideal effects.",
      assessment: "Circuit calculations, simulation assignments and a signal-conditioning project."
    },
    {
      id: "instrumentation", department: "electronics", title: "Electronic Measurements & Instrumentation", level: "Intermediate", duration: "24 learning hours", status: "Coming Soon",
      description: "Interpret instrument loading, uncertainty, calibration and measurement traceability.",
      prerequisites: "Basic circuit analysis and introductory statistics.",
      outcomes: ["Choose meaningful measurements and units.", "Estimate uncertainty and explain instrument limitations."],
      practical: "Analyse supplied synthetic measurement data and prepare a low-voltage measurement plan; hardware optional.",
      assessment: "Measurement-plan review, uncertainty calculations and a technical report."
    },
    {
      id: "ai-foundations", department: "ai", title: "AI & Machine Learning Fundamentals for Engineers", level: "Foundation", duration: "24 learning hours", status: "In Development",
      description: "Understand data, model training, evaluation and the limits of engineering predictions.",
      prerequisites: "Basic Python, algebra and introductory statistics.",
      outcomes: ["Distinguish training, validation and test data.", "Identify leakage, bias and inappropriate performance metrics."],
      practical: "Evaluate a small regression model on synthetic engineering data using a held-out test set.",
      assessment: "Concept questions, reproducible notebook and model-evaluation report."
    },
    {
      id: "ai-data", department: "ai", title: "Engineering Data Analysis with AI", level: "Intermediate", duration: "28 learning hours", status: "Coming Soon",
      description: "Combine engineering checks with exploratory analysis and interpretable models.",
      prerequisites: "Python data processing, basic statistics and AI fundamentals.",
      outcomes: ["Build reproducible preprocessing steps.", "Compare model predictions against physical expectations."],
      practical: "Investigate a synthetic sensor dataset and document baselines, errors and limitations.",
      assessment: "Data-quality tasks, reproducible analysis and an engineering model critique."
    },
    {
      id: "ai-workflows", department: "ai", title: "AI-Assisted Programming & Responsible Engineering Workflows", level: "Intermediate", duration: "20 learning hours", status: "Coming Soon",
      description: "Use AI assistance with human review, testing, attribution and confidentiality safeguards.",
      prerequisites: "Programming experience and basic software testing.",
      outcomes: ["Validate AI-generated suggestions independently.", "Recognise confidentiality, licensing and hallucination risks."],
      practical: "Compare human-reviewed solutions using synthetic prompts, tests and a decision log; no confidential uploads.",
      assessment: "Test evidence, error analysis and a responsible-use review."
    }
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function addFact(list, label, value) {
    list.append(element("dt", "", label), element("dd", "", value));
  }

  function courseCard(course, department) {
    const card = element("article", "card course-card");
    card.id = course.id;
    const meta = element("div", "course-meta");
    meta.append(element("span", "pill", course.status), element("span", "pill", course.level));
    card.append(meta, element("p", "course-department", department.title), element("h3", "", course.title), element("p", "", course.description));
    const facts = element("dl", "course-facts");
    addFact(facts, "Proposed duration", course.duration);
    addFact(facts, "Prerequisites", course.prerequisites);
    const details = element("details");
    const content = element("div");
    const outcomes = element("ul");
    course.outcomes.forEach((outcome) => outcomes.append(element("li", "", outcome)));
    content.append(
      element("h4", "", "Proposed learning outcomes"), outcomes,
      element("h4", "", "Practical component"), element("p", "", course.practical),
      element("h4", "", "Proposed assessment"), element("p", "", course.assessment)
    );
    details.append(element("summary", "", "Outcomes, practical work & assessment"), content);
    card.append(facts, details);
    return card;
  }

  const catalogue = document.getElementById("courseCatalogue");
  if (catalogue) {
    const departmentSelect = document.getElementById("departmentFilter");
    const levelSelect = document.getElementById("levelFilter");
    const count = document.getElementById("courseResultCount");
    const empty = document.getElementById("courseEmpty");
    const filterNotice = document.getElementById("filterNotice");
    departments.forEach((department) => {
      const option = element("option", "", department.title);
      option.value = department.id;
      departmentSelect.append(option);
    });
    const requestedDepartment = new URLSearchParams(window.location.search).get("department");
    if (requestedDepartment) {
      if (departments.some((department) => department.id === requestedDepartment)) {
        departmentSelect.value = requestedDepartment;
      } else {
        filterNotice.hidden = false;
        filterNotice.textContent = "The requested department is not recognised. Showing all departments; choose a filter below.";
      }
    }

    function renderCourses() {
      const filtered = courses.filter((course) =>
        (departmentSelect.value === "all" || course.department === departmentSelect.value)
        && (levelSelect.value === "all" || course.level === levelSelect.value)
      );
      catalogue.replaceChildren();
      departments.forEach((department) => {
        const groupCourses = filtered.filter((course) => course.department === department.id);
        if (!groupCourses.length) return;
        const section = element("section", "catalogue-group");
        section.id = `department-${department.id}`;
        const heading = element("h2", "", department.title);
        heading.id = `${section.id}-title`;
        section.setAttribute("aria-labelledby", heading.id);
        const grid = element("div", "course-grid");
        groupCourses.forEach((course) => grid.append(courseCard(course, department)));
        section.append(heading, grid);
        catalogue.append(section);
      });
      count.textContent = `${filtered.length} proposed ${filtered.length === 1 ? "course" : "courses"} shown. Enrolment is not open.`;
      empty.hidden = filtered.length !== 0;
    }

    departmentSelect.addEventListener("change", renderCourses);
    levelSelect.addEventListener("change", renderCourses);
    document.getElementById("resetFilters").addEventListener("click", () => {
      departmentSelect.value = "all";
      levelSelect.value = "all";
      filterNotice.hidden = true;
      renderCourses();
    });
    document.getElementById("courseFilters").hidden = false;
    renderCourses();
  }

  /**
   * Future trusted-registry boundary. No lookup or network request is performed today.
   * Replace only after an authoritative, privacy-reviewed registry is deployed.
   * Public responses must omit names, email, birth dates, marks and identity documents.
   * @param {string} certificateId
   * @returns {Promise<{status: string, certificateId?: string, courseTitle?: string, issueDate?: string}>}
   */
  async function lookupCertificate(certificateId) {
    return { status: "unavailable" };
  }

  const verifyForm = document.getElementById("certificateForm");
  if (verifyForm) {
    const input = document.getElementById("certificateId");
    const button = document.getElementById("verifyButton");
    const result = document.getElementById("verificationResult");
    const titles = {
      unavailable: "Online verification is not connected",
      invalid: "Check the certificate ID format",
      "not-found": "Certificate ID not found in the registry",
      valid: "Certificate confirmed by the registry",
      revoked: "Certificate revoked",
      superseded: "Certificate superseded",
      pending: "Checking registry availability",
      error: "Verification could not be completed"
    };
    const messages = {
      unavailable: "No authoritative certificate registry is connected. This ID has not been verified or checked for existence. A correctly formatted ID does not establish a certificate's authenticity.",
      invalid: "Enter 6 to 64 letters, numbers or hyphens, beginning with a letter or number. This is a provisional input-format check only, not a certificate-database result.",
      "not-found": "The connected registry returned no matching public credential. Recheck the ID or use the official correction enquiry channel.",
      valid: "The connected authoritative registry confirms this credential's current status. Only minimal public certificate details are shown.",
      revoked: "The connected registry marks this credential as revoked. It must not be relied on as a current credential.",
      superseded: "The connected registry marks this credential as replaced. Ask the holder for the current credential.",
      pending: "Please wait. No certificate status has been established.",
      error: "No certificate status has been established. Please try again later or contact the academy through the published enquiry channel."
    };

    function showResult(state, record) {
      if (!Object.hasOwn(titles, state)) throw new Error("Unsupported certificate registry status.");
      result.dataset.state = state;
      result.replaceChildren(element("h2", "", titles[state]), element("p", "", messages[state]));
      if (record && ["valid", "revoked", "superseded"].includes(state)) {
        const facts = element("dl", "verification-record");
        addFact(facts, "Certificate ID", record.certificateId);
        addFact(facts, "Course", record.courseTitle);
        addFact(facts, "Issue date", record.issueDate);
        addFact(facts, "Registry status", state);
        result.append(facts);
      }
    }

    verifyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const certificateId = input.value.trim();
      if (!/^[A-Za-z0-9][A-Za-z0-9-]{5,63}$/.test(certificateId)) {
        input.setAttribute("aria-invalid", "true");
        showResult("invalid");
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      button.disabled = true;
      result.setAttribute("aria-busy", "true");
      showResult("pending");
      try {
        const record = await lookupCertificate(certificateId);
        const allowed = ["unavailable", "not-found", "valid", "revoked", "superseded"];
        if (!record || !allowed.includes(record.status)) throw new Error("Invalid certificate registry response.");
        if (["valid", "revoked", "superseded"].includes(record.status)) {
          if (record.certificateId !== certificateId
            || typeof record.courseTitle !== "string" || !record.courseTitle.trim()
            || typeof record.issueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(record.issueDate)) {
            throw new Error("Certificate registry response is incomplete or does not match the requested ID.");
          }
        }
        showResult(record.status, record);
      } catch (error) {
        console.error("Academy certificate verification failed.", error);
        showResult("error");
      } finally {
        button.disabled = false;
        result.setAttribute("aria-busy", "false");
      }
    });
    button.disabled = false;
  }
}());
