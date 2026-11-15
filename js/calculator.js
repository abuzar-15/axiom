/**
 * Axiom Scientific Calculator - Core Calculation Engine
 * Copyright (c) 2026 Mohammad Abuzar Alam. All rights reserved.
 * Author: Mohammad Abuzar Alam (abuzaraalam34@gmail.com)
 *
 * Implements a safe, zero-eval mathematical expression tokenizer,
 * Dijkstra's Shunting-Yard parser, and Reverse Polish Notation (RPN) evaluator.
 * Fully supports operator precedence, parentheses, unary operators,
 * scientific functions, trigonometric modes (DEG, RAD, GRAD),
 * memory registers, and calculation history.
 */

class ScientificCalculator {
  constructor() {
    // Calculator state
    this.expression = '';      // Full formula expression being typed
    this.displayValue = '0';   // Primary display line (current entry or result)
    this.previousResult = null;// Last calculated answer
    this.isResultState = false;// True immediately after pressing '='
    this.angleMode = 'DEG';    // 'DEG' | 'RAD' | 'GRAD'
    this.memoryValue = 0;      // Value currently stored in memory
    this.history = [];         // Session calculation history array
    this.isInverseMode = false;// Secondary scientific functions (sin⁻¹, cos⁻¹, etc.)
    this.isHyperbolic = false; // Hyperbolic mode (sinh, cosh, tanh)
    this.isFractionMode = false;
    this.fractionString = '';
    this.baseMode = 'DEC';     // 'DEC' | 'HEX' | 'BIN' | 'OCT'
    this.isEngineeringMode = false;

    // Mathematical Constants
    this.CONSTANTS = {
      pi: Math.PI,
      e: Math.E,
      tau: 2 * Math.PI,
      phi: (1 + Math.sqrt(5)) / 2
    };

    // Comprehensive Physical & Scientific Constants
    this.PHYSICAL_CONSTANTS = [
      { id: 'c', name: 'Speed of Light', symbol: 'c', value: 299792458, unit: 'm/s', category: 'Universal', desc: 'Speed of light in vacuum' },
      { id: 'h', name: "Planck's Constant", symbol: 'h', value: 6.62607015e-34, unit: 'J·s', category: 'Quantum', desc: 'Fundamental quantum of action' },
      { id: 'hbar', name: "Reduced Planck's Constant", symbol: 'ħ', value: 1.054571817e-34, unit: 'J·s', category: 'Quantum', desc: 'h / (2π)' },
      { id: 'G', name: 'Gravitational Constant', symbol: 'G', value: 6.67430e-11, unit: 'm³/(kg·s²)', category: 'Astrophysics', desc: 'Newtonian gravitational constant' },
      { id: 'Na', name: 'Avogadro Constant', symbol: 'N_A', value: 6.02214076e23, unit: 'mol⁻¹', category: 'Atomic', desc: 'Number of particles per mole' },
      { id: 'k', name: 'Boltzmann Constant', symbol: 'k_B', value: 1.380649e-23, unit: 'J/K', category: 'Thermodynamics', desc: 'Relates temperature to particle energy' },
      { id: 'qe', name: 'Elementary Charge', symbol: 'e', value: 1.602176634e-19, unit: 'C', category: 'Electromagnetic', desc: 'Charge of single proton/electron' },
      { id: 'me', name: 'Electron Rest Mass', symbol: 'm_e', value: 9.1093837e-31, unit: 'kg', category: 'Atomic', desc: 'Invariant rest mass of electron' },
      { id: 'mp', name: 'Proton Rest Mass', symbol: 'm_p', value: 1.67262192e-27, unit: 'kg', category: 'Atomic', desc: 'Invariant rest mass of proton' },
      { id: 'R', name: 'Molar Gas Constant', symbol: 'R', value: 8.314462618, unit: 'J/(mol·K)', category: 'Thermodynamics', desc: 'Universal gas constant' },
      { id: 'sigma', name: 'Stefan-Boltzmann Constant', symbol: 'σ', value: 5.670374419e-8, unit: 'W/(m²·K⁴)', category: 'Thermodynamics', desc: 'Radiated power per unit area' },
      { id: 'g', name: 'Standard Earth Gravity', symbol: 'g', value: 9.80665, unit: 'm/s²', category: 'Mechanics', desc: 'Standard acceleration due to gravity' },
      { id: 'atm', name: 'Standard Atmosphere', symbol: 'atm', value: 101325, unit: 'Pa', category: 'Mechanics', desc: 'Standard atmospheric pressure at sea level' },
      { id: 'eps0', name: 'Vacuum Permittivity', symbol: 'ε₀', value: 8.8541878128e-12, unit: 'F/m', category: 'Electromagnetic', desc: 'Electric permittivity of free space' },
      { id: 'mu0', name: 'Vacuum Permeability', symbol: 'μ₀', value: 1.25663706212e-6, unit: 'N/A²', category: 'Electromagnetic', desc: 'Magnetic permeability of free space' }
    ];

    // Index constants by ID for convenient property access (e.g. calc.PHYSICAL_CONSTANTS.c)
    this.PHYSICAL_CONSTANTS.forEach(item => {
      this.PHYSICAL_CONSTANTS[item.id] = item;
    });

    this.originalDecimalValue = null;
    this.baseNumericValue = null;

    // Operator definitions with precedence, associativity, and arity
    this.OPERATORS = {
      '+': { precedence: 2, assoc: 'L', arity: 2 },
      '-': { precedence: 2, assoc: 'L', arity: 2 },
      '*': { precedence: 3, assoc: 'L', arity: 2 },
      '/': { precedence: 3, assoc: 'L', arity: 2 },
      '%': { precedence: 3, assoc: 'L', arity: 2 },
      '^': { precedence: 4, assoc: 'R', arity: 2 },
      'u-': { precedence: 5, assoc: 'R', arity: 1 }, // Unary negation
      '!': { precedence: 6, assoc: 'L', arity: 1 }  // Factorial postfix
    };

    // Load persisted state (history, memory, angleMode)
    this.loadState();
  }

  /**
   * Loads calculator state from localStorage
   */
  loadState() {
    try {
      const savedMode = localStorage.getItem('calc_angle_mode');
      if (savedMode && ['DEG', 'RAD', 'GRAD'].includes(savedMode)) {
        this.angleMode = savedMode;
      }
      const savedMemory = localStorage.getItem('calc_memory_value');
      if (savedMemory && !isNaN(Number(savedMemory))) {
        this.memoryValue = Number(savedMemory);
      }
      const savedHistory = localStorage.getItem('calc_history');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
    } catch (e) {
      console.warn('Unable to load calculator state from localStorage:', e);
    }
  }

  /**
   * Persists calculator state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem('calc_angle_mode', this.angleMode);
      localStorage.setItem('calc_memory_value', String(this.memoryValue));
      localStorage.setItem('calc_history', JSON.stringify(this.history.slice(0, 50)));
    } catch (e) {
      console.warn('Unable to save calculator state to localStorage:', e);
    }
  }

  /**
   * Set angle mode (DEG, RAD, GRAD)
   * @param {'DEG'|'RAD'|'GRAD'} mode 
   */
  setAngleMode(mode) {
    if (['DEG', 'RAD', 'GRAD'].includes(mode)) {
      this.angleMode = mode;
      this.saveState();
      if (window.audioFeedback) window.audioFeedback.playModeChange();
      if (window.accessibilityManager) {
        const modeNames = { DEG: 'Degree', RAD: 'Radian', GRAD: 'Gradian' };
        window.accessibilityManager.announce(`${modeNames[mode]} mode selected.`);
      }
    }
  }

  /**
   * Cycle to next angle mode
   */
  toggleAngleMode() {
    const modes = ['DEG', 'RAD', 'GRAD'];
    const nextIdx = (modes.indexOf(this.angleMode) + 1) % modes.length;
    this.setAngleMode(modes[nextIdx]);
  }

  /**
   * Toggle 2nd/Inverse mode
   */
  toggleInverseMode() {
    this.isInverseMode = !this.isInverseMode;
    this.updateUI();
    if (window.audioFeedback) window.audioFeedback.playScientific();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(
        this.isInverseMode ? 'Inverse functions enabled.' : 'Primary functions enabled.'
      );
    }
  }

  /**
   * Toggle Hyperbolic mode
   */
  toggleHyperbolicMode() {
    this.isHyperbolic = !this.isHyperbolic;
    this.updateUI();
    if (window.audioFeedback) window.audioFeedback.playScientific();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(
        this.isHyperbolic ? 'Hyperbolic functions enabled.' : 'Standard trigonometric functions enabled.'
      );
    }
  }

  /**
   * Angle conversion utilities
   */
  toRadians(angle) {
    if (this.angleMode === 'DEG') {
      return (angle * Math.PI) / 180;
    }
    if (this.angleMode === 'GRAD') {
      return (angle * Math.PI) / 200;
    }
    return angle; // RAD
  }

  fromRadians(radians) {
    if (this.angleMode === 'DEG') {
      return (radians * 180) / Math.PI;
    }
    if (this.angleMode === 'GRAD') {
      return (radians * 200) / Math.PI;
    }
    return radians; // RAD
  }

  // ==========================================
  // MATHEMATICAL FUNCTIONS IMPLEMENTATION
  // ==========================================

  // Factorial with non-negative integer check
  factorial(n) {
    if (!Number.isInteger(n)) {
      throw new Error('Factorial requires an integer value');
    }
    if (n < 0) {
      throw new Error('Factorial of a negative number is undefined');
    }
    if (n > 170) {
      throw new Error('Factorial overflow (value exceeds 170!)');
    }
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
    }
    return res;
  }

  // Permutations nPr
  nPr(n, r) {
    if (!Number.isInteger(n) || !Number.isInteger(r)) {
      throw new Error('nPr requires integer inputs');
    }
    if (n < 0 || r < 0) {
      throw new Error('nPr inputs must be non-negative');
    }
    if (r > n) {
      throw new Error('nPr requires n >= r');
    }
    return this.factorial(n) / this.factorial(n - r);
  }

  // Combinations nCr
  nCr(n, r) {
    if (!Number.isInteger(n) || !Number.isInteger(r)) {
      throw new Error('nCr requires integer inputs');
    }
    if (n < 0 || r < 0) {
      throw new Error('nCr inputs must be non-negative');
    }
    if (r > n) {
      throw new Error('nCr requires n >= r');
    }
    return this.factorial(n) / (this.factorial(r) * this.factorial(n - r));
  }

  // Greatest Common Divisor (GCD / HCF)
  gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  // Least Common Multiple (LCM)
  lcm(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    if (a === 0 || b === 0) return 0;
    return (a * b) / this.gcd(a, b);
  }

  // Sine with exact checks for common angles
  sin(x) {
    const rad = this.toRadians(x);
    // Eliminate floating point imperfections near 0 for multiples of pi
    if (this.angleMode === 'DEG') {
      const normalized = Math.abs(x) % 360;
      if (normalized === 0 || normalized === 180) return 0;
      if (normalized === 90) return (x >= 0 ? 1 : -1);
      if (normalized === 270) return (x >= 0 ? -1 : 1);
    } else if (this.angleMode === 'GRAD') {
      const normalized = Math.abs(x) % 400;
      if (normalized === 0 || normalized === 200) return 0;
      if (normalized === 100) return (x >= 0 ? 1 : -1);
      if (normalized === 300) return (x >= 0 ? -1 : 1);
    }
    const val = Math.sin(rad);
    return Math.abs(val) < 1e-15 ? 0 : val;
  }

  // Cosine with exact checks
  cos(x) {
    const rad = this.toRadians(x);
    if (this.angleMode === 'DEG') {
      const normalized = Math.abs(x) % 360;
      if (normalized === 90 || normalized === 270) return 0;
      if (normalized === 0) return 1;
      if (normalized === 180) return -1;
    } else if (this.angleMode === 'GRAD') {
      const normalized = Math.abs(x) % 400;
      if (normalized === 100 || normalized === 300) return 0;
      if (normalized === 0) return 1;
      if (normalized === 200) return -1;
    }
    const val = Math.cos(rad);
    return Math.abs(val) < 1e-15 ? 0 : val;
  }

  // Tangent with singularity check
  tan(x) {
    if (this.angleMode === 'DEG') {
      const normalized = Math.abs(x) % 360;
      if (normalized === 90 || normalized === 270) {
        throw new Error('Tangent is undefined at 90° and 270°');
      }
    } else if (this.angleMode === 'GRAD') {
      const normalized = Math.abs(x) % 400;
      if (normalized === 100 || normalized === 300) {
        throw new Error('Tangent is undefined at 100 and 300 grad');
      }
    }
    const cosVal = this.cos(x);
    if (Math.abs(cosVal) < 1e-15) {
      throw new Error('Tangent is undefined');
    }
    const val = this.sin(x) / cosVal;
    return Math.abs(val) < 1e-15 ? 0 : val;
  }

  // Cosecant (1/sin)
  csc(x) {
    const s = this.sin(x);
    if (Math.abs(s) < 1e-15) throw new Error('Cosecant is undefined (division by zero)');
    return 1 / s;
  }

  // Secant (1/cos)
  sec(x) {
    const c = this.cos(x);
    if (Math.abs(c) < 1e-15) throw new Error('Secant is undefined (division by zero)');
    return 1 / c;
  }

  // Cotangent (cos/sin)
  cot(x) {
    const s = this.sin(x);
    if (Math.abs(s) < 1e-15) throw new Error('Cotangent is undefined (division by zero)');
    return this.cos(x) / s;
  }

  // Inverse Sine
  asin(x) {
    if (x < -1 || x > 1) {
      throw new Error('Domain error: arcsin requires -1 <= x <= 1');
    }
    return this.fromRadians(Math.asin(x));
  }

  // Inverse Cosine
  acos(x) {
    if (x < -1 || x > 1) {
      throw new Error('Domain error: arccos requires -1 <= x <= 1');
    }
    return this.fromRadians(Math.acos(x));
  }

  // Inverse Tangent
  atan(x) {
    return this.fromRadians(Math.atan(x));
  }

  // Inverse Cosecant (arccsc)
  acsc(x) {
    if (Math.abs(x) < 1) {
      throw new Error('Domain error: arccsc requires |x| >= 1');
    }
    return this.fromRadians(Math.asin(1 / x));
  }

  // Inverse Secant (arcsec)
  asec(x) {
    if (Math.abs(x) < 1) {
      throw new Error('Domain error: arcsec requires |x| >= 1');
    }
    return this.fromRadians(Math.acos(1 / x));
  }

  // Inverse Cotangent (arccot)
  acot(x) {
    if (x === 0) return this.fromRadians(Math.PI / 2);
    return this.fromRadians(Math.atan(1 / x));
  }

  // Hyperbolic Functions
  sinh(x) { return Math.sinh(x); }
  cosh(x) { return Math.cosh(x); }
  tanh(x) { return Math.tanh(x); }
  csch(x) {
    if (Math.abs(x) < 1e-15) throw new Error('Cosecant hyperbolic is undefined at 0');
    return 1 / Math.sinh(x);
  }
  sech(x) {
    return 1 / Math.cosh(x);
  }
  coth(x) {
    if (Math.abs(x) < 1e-15) throw new Error('Cotangent hyperbolic is undefined at 0');
    return Math.cosh(x) / Math.sinh(x);
  }
  asinh(x) { return Math.asinh(x); }
  acosh(x) {
    if (x < 1) throw new Error('Domain error: acosh requires x >= 1');
    return Math.acosh(x);
  }
  atanh(x) {
    if (x <= -1 || x >= 1) throw new Error('Domain error: atanh requires -1 < x < 1');
    return Math.atanh(x);
  }
  acsch(x) {
    if (Math.abs(x) < 1e-15) throw new Error('Domain error: acsch requires x != 0');
    return Math.asinh(1 / x);
  }
  asech(x) {
    if (x <= 0 || x > 1) throw new Error('Domain error: asech requires 0 < x <= 1');
    return Math.acosh(1 / x);
  }
  acoth(x) {
    if (Math.abs(x) <= 1) throw new Error('Domain error: acoth requires |x| > 1');
    return Math.atanh(1 / x);
  }

  // Square root
  sqrt(x) {
    if (x < 0) throw new Error('Square root of negative number is undefined in real numbers');
    return Math.sqrt(x);
  }

  // Cube root
  cbrt(x) {
    return Math.cbrt(x);
  }

  // nth root
  nthRoot(x, n) {
    if (n === 0) throw new Error('0th root is undefined');
    if (x < 0 && n % 2 === 0) {
      throw new Error('Even root of negative number is undefined in real numbers');
    }
    if (x < 0) {
      return -Math.pow(-x, 1 / n);
    }
    return Math.pow(x, 1 / n);
  }

  // Natural Logarithm ln(x)
  ln(x) {
    if (x <= 0) throw new Error('Logarithm of non-positive number is undefined');
    return Math.log(x);
  }

  // Log base 10
  log10(x) {
    if (x <= 0) throw new Error('Logarithm of non-positive number is undefined');
    return Math.log10(x);
  }

  // Log base 2
  log2(x) {
    if (x <= 0) throw new Error('Logarithm of non-positive number is undefined');
    return Math.log2(x);
  }

  // Power
  power(base, exponent) {
    if (base < 0 && !Number.isInteger(exponent)) {
      throw new Error('Negative base with non-integer exponent produces complex number');
    }
    if (base === 0 && exponent < 0) {
      throw new Error('Division by zero in 0 to negative power');
    }
    return Math.pow(base, exponent);
  }

  // Reciprocal
  reciprocal(x) {
    if (x === 0) throw new Error('Cannot divide by zero');
    return 1 / x;
  }

  // ==========================================
  // SAFE TOKENIZER & SHUNTING YARD PARSER
  // ==========================================

  /**
   * Tokenizes an infix expression into numbers, operators, constants, and function calls.
   * Inserts implicit multiplication where appropriate (e.g., 2(3) -> 2*(3), 5pi -> 5*pi).
   * @param {string} expr 
   * @returns {Array<Object>}
   */
  tokenize(expr) {
    // Replace visual symbols with standard representations
    let cleaned = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/τ/g, 'tau')
      .replace(/φ/g, 'phi')
      .trim();

    const tokens = [];
    let i = 0;
    const len = cleaned.length;

    // List of known function identifiers
    const functionNames = [
      'sin', 'cos', 'tan', 'csc', 'sec', 'cot',
      'asin', 'acos', 'atan', 'acsc', 'asec', 'acot',
      'sinh', 'cosh', 'tanh', 'csch', 'sech', 'coth',
      'asinh', 'acosh', 'atanh', 'acsch', 'asech', 'acoth',
      'sqrt', 'cbrt', 'nthRoot', 'sqr', 'cube', 'recip',
      'ln', 'log10', 'log2', 'log', 'exp', 'pow10', 'pow2',
      'fact', 'nPr', 'nCr', 'gcd', 'lcm', 'abs',
      'round', 'floor', 'ceil', 'sign', 'rand', 'mod'
    ];

    while (i < len) {
      const ch = cleaned[i];

      // Skip whitespace
      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // 1. Number parsing (supports integer, decimal, and scientific notation e.g. 1.5e-3)
      if (/\d|\./.test(ch)) {
        let numStr = '';
        let hasDot = false;
        while (i < len && (/[\d.]/.test(cleaned[i]) || (/[eE]/.test(cleaned[i]) && numStr.length > 0))) {
          if (cleaned[i] === '.') {
            if (hasDot) break;
            hasDot = true;
          }
          if (/[eE]/.test(cleaned[i])) {
            numStr += cleaned[i];
            i++;
            if (i < len && (cleaned[i] === '+' || cleaned[i] === '-')) {
              numStr += cleaned[i];
              i++;
            }
            continue;
          }
          numStr += cleaned[i];
          i++;
        }
        const val = parseFloat(numStr);
        if (isNaN(val)) throw new Error(`Invalid number: ${numStr}`);
        
        // Handle implicit multiplication before number if previous was ')' or constant or '!'
        if (tokens.length > 0) {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'paren' && prev.value === ')' || prev.type === 'constant' || prev.type === 'op' && prev.value === '!') {
            tokens.push({ type: 'op', value: '*' });
          }
        }
        tokens.push({ type: 'number', value: val });
        continue;
      }

      // 2. Word tokens: Function names or Constants
      if (/[a-zA-Z]/.test(ch)) {
        let word = '';
        while (i < len && /[a-zA-Z0-9]/.test(cleaned[i])) {
          word += cleaned[i];
          i++;
        }

        // Check if constant
        if (['pi', 'e', 'tau', 'phi'].includes(word.toLowerCase())) {
          // Implicit multiplication before constant if preceded by number, constant, or ')'
          if (tokens.length > 0) {
            const prev = tokens[tokens.length - 1];
            if (prev.type === 'number' || prev.type === 'constant' || (prev.type === 'paren' && prev.value === ')')) {
              tokens.push({ type: 'op', value: '*' });
            }
          }
          tokens.push({ type: 'constant', value: word.toLowerCase() });
          continue;
        }

        // Check if known function
        const matchedFunc = functionNames.find(f => f.toLowerCase() === word.toLowerCase());
        if (matchedFunc) {
          // Implicit multiplication if preceded by number or ')'
          if (tokens.length > 0) {
            const prev = tokens[tokens.length - 1];
            if (prev.type === 'number' || prev.type === 'constant' || (prev.type === 'paren' && prev.value === ')')) {
              tokens.push({ type: 'op', value: '*' });
            }
          }
          tokens.push({ type: 'function', value: matchedFunc });
          continue;
        }

        throw new Error(`Unknown mathematical identifier: ${word}`);
      }

      // 3. Parentheses & Argument Separators
      if (ch === '(') {
        if (tokens.length > 0) {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'number' || prev.type === 'constant' || (prev.type === 'paren' && prev.value === ')') || (prev.type === 'op' && prev.value === '!')) {
            tokens.push({ type: 'op', value: '*' });
          }
        }
        tokens.push({ type: 'paren', value: '(' });
        i++;
        continue;
      }

      if (ch === ')') {
        tokens.push({ type: 'paren', value: ')' });
        i++;
        continue;
      }

      if (ch === ',') {
        tokens.push({ type: 'comma', value: ',' });
        i++;
        continue;
      }

      // 4. Factorial postfix operator '!'
      if (ch === '!') {
        tokens.push({ type: 'op', value: '!' });
        i++;
        continue;
      }

      // 5. Operators (+, -, *, /, %, ^)
      if (['+', '-', '*', '/', '%', '^'].includes(ch)) {
        // Distinguish unary minus from binary subtraction
        let opValue = ch;
        if (ch === '-') {
          const prev = tokens[tokens.length - 1];
          // Unary minus if at start of expression, or immediately after an operator, open paren, or comma
          if (!prev || (prev.type === 'op' && prev.value !== '!') || (prev.type === 'paren' && prev.value === '(') || prev.type === 'comma') {
            opValue = 'u-'; // Unary negation
          }
        } else if (ch === '+') {
          const prev = tokens[tokens.length - 1];
          if (!prev || (prev.type === 'op' && prev.value !== '!') || (prev.type === 'paren' && prev.value === '(') || prev.type === 'comma') {
            // Unary plus is a no-op, skip it
            i++;
            continue;
          }
        }

        tokens.push({ type: 'op', value: opValue });
        i++;
        continue;
      }

      throw new Error(`Unexpected character: '${ch}'`);
    }

    return tokens;
  }

  /**
   * Converts infix token list to Reverse Polish Notation (RPN) via Dijkstra's Shunting-Yard
   * @param {Array<Object>} tokens 
   * @returns {Array<Object>}
   */
  shuntingYard(tokens) {
    const output = [];
    const opStack = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'number') {
        output.push(token);
      } else if (token.type === 'constant') {
        output.push({ type: 'number', value: this.CONSTANTS[token.value] });
      } else if (token.type === 'function') {
        opStack.push(token);
      } else if (token.type === 'comma') {
        while (opStack.length > 0 && opStack[opStack.length - 1].value !== '(') {
          output.push(opStack.pop());
        }
        if (opStack.length === 0) {
          throw new Error('Misplaced comma or missing open parenthesis');
        }
      } else if (token.type === 'op') {
        const o1 = token.value;
        const op1Info = this.OPERATORS[o1];

        if (!op1Info) {
          throw new Error(`Unsupported operator: ${o1}`);
        }

        while (opStack.length > 0) {
          const top = opStack[opStack.length - 1];
          if (top.type === 'op') {
            const o2 = top.value;
            const op2Info = this.OPERATORS[o2];
            if (
              (op1Info.assoc === 'L' && op1Info.precedence <= op2Info.precedence) ||
              (op1Info.assoc === 'R' && op1Info.precedence < op2Info.precedence)
            ) {
              output.push(opStack.pop());
              continue;
            }
          } else if (top.type === 'function') {
            output.push(opStack.pop());
            continue;
          }
          break;
        }
        opStack.push(token);
      } else if (token.type === 'paren' && token.value === '(') {
        opStack.push(token);
      } else if (token.type === 'paren' && token.value === ')') {
        let foundOpen = false;
        while (opStack.length > 0) {
          const top = opStack.pop();
          if (top.type === 'paren' && top.value === '(') {
            foundOpen = true;
            break;
          }
          output.push(top);
        }
        if (!foundOpen) {
          throw new Error('Mismatched parentheses: unexpected closing parenthesis');
        }
        if (opStack.length > 0 && opStack[opStack.length - 1].type === 'function') {
          output.push(opStack.pop());
        }
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop();
      if (top.type === 'paren') {
        throw new Error('Mismatched parentheses: unclosed open parenthesis');
      }
      output.push(top);
    }

    return output;
  }

  /**
   * Evaluates an RPN token list safely without eval()
   * @param {Array<Object>} rpnTokens 
   * @returns {number}
   */
  evaluateRPN(rpnTokens) {
    const stack = [];

    for (let i = 0; i < rpnTokens.length; i++) {
      const token = rpnTokens[i];

      if (token.type === 'number') {
        stack.push(token.value);
        continue;
      }

      if (token.type === 'op') {
        const op = token.value;

        // Unary negation
        if (op === 'u-') {
          if (stack.length < 1) throw new Error('Syntax error: missing operand for negation');
          const val = stack.pop();
          stack.push(-val);
          continue;
        }

        // Factorial
        if (op === '!') {
          if (stack.length < 1) throw new Error('Syntax error: missing operand for factorial');
          const val = stack.pop();
          stack.push(this.factorial(val));
          continue;
        }

        // Binary operators
        if (stack.length < 2) throw new Error(`Syntax error: insufficient operands for operator '${op}'`);
        const b = stack.pop();
        const a = stack.pop();

        switch (op) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            if (b === 0) throw new Error('Cannot divide by zero');
            stack.push(a / b);
            break;
          case '%':
            if (b === 0) throw new Error('Cannot calculate modulo by zero');
            stack.push(a % b);
            break;
          case '^':
            stack.push(this.power(a, b));
            break;
          default:
            throw new Error(`Unknown operator: ${op}`);
        }
        continue;
      }

      if (token.type === 'function') {
        const fn = token.value;

        // Two-argument functions
        if (['nPr', 'nCr', 'gcd', 'lcm', 'nthRoot', 'mod'].includes(fn)) {
          if (stack.length < 2) throw new Error(`Function '${fn}' requires two arguments`);
          const b = stack.pop();
          const a = stack.pop();
          switch (fn) {
            case 'nPr': stack.push(this.nPr(a, b)); break;
            case 'nCr': stack.push(this.nCr(a, b)); break;
            case 'gcd': stack.push(this.gcd(a, b)); break;
            case 'lcm': stack.push(this.lcm(a, b)); break;
            case 'nthRoot': stack.push(this.nthRoot(a, b)); break;
            case 'mod':
              if (b === 0) throw new Error('Cannot calculate modulo by zero');
              stack.push(a % b);
              break;
          }
          continue;
        }

        // Zero-argument functions
        if (fn === 'rand') {
          stack.push(Math.random());
          continue;
        }

        // Single-argument functions
        if (stack.length < 1) throw new Error(`Function '${fn}' requires an argument`);
        const arg = stack.pop();

        switch (fn) {
          case 'sin': stack.push(this.sin(arg)); break;
          case 'cos': stack.push(this.cos(arg)); break;
          case 'tan': stack.push(this.tan(arg)); break;
          case 'csc': stack.push(this.csc(arg)); break;
          case 'sec': stack.push(this.sec(arg)); break;
          case 'cot': stack.push(this.cot(arg)); break;
          case 'asin': stack.push(this.asin(arg)); break;
          case 'acos': stack.push(this.acos(arg)); break;
          case 'atan': stack.push(this.atan(arg)); break;
          case 'acsc': stack.push(this.acsc(arg)); break;
          case 'asec': stack.push(this.asec(arg)); break;
          case 'acot': stack.push(this.acot(arg)); break;
          case 'sinh': stack.push(this.sinh(arg)); break;
          case 'cosh': stack.push(this.cosh(arg)); break;
          case 'tanh': stack.push(this.tanh(arg)); break;
          case 'csch': stack.push(this.csch(arg)); break;
          case 'sech': stack.push(this.sech(arg)); break;
          case 'coth': stack.push(this.coth(arg)); break;
          case 'asinh': stack.push(this.asinh(arg)); break;
          case 'acosh': stack.push(this.acosh(arg)); break;
          case 'atanh': stack.push(this.atanh(arg)); break;
          case 'acsch': stack.push(this.acsch(arg)); break;
          case 'asech': stack.push(this.asech(arg)); break;
          case 'acoth': stack.push(this.acoth(arg)); break;
          case 'sqrt': stack.push(this.sqrt(arg)); break;
          case 'cbrt': stack.push(this.cbrt(arg)); break;
          case 'sqr': stack.push(arg * arg); break;
          case 'cube': stack.push(arg * arg * arg); break;
          case 'recip': stack.push(this.reciprocal(arg)); break;
          case 'ln': stack.push(this.ln(arg)); break;
          case 'log':
          case 'log10': stack.push(this.log10(arg)); break;
          case 'log2': stack.push(this.log2(arg)); break;
          case 'exp': stack.push(Math.exp(arg)); break;
          case 'pow10': stack.push(Math.pow(10, arg)); break;
          case 'pow2': stack.push(Math.pow(2, arg)); break;
          case 'fact': stack.push(this.factorial(arg)); break;
          case 'abs': stack.push(Math.abs(arg)); break;
          case 'round': stack.push(Math.round(arg)); break;
          case 'floor': stack.push(Math.floor(arg)); break;
          case 'ceil': stack.push(Math.ceil(arg)); break;
          case 'sign': stack.push(Math.sign(arg)); break;
          default:
            throw new Error(`Unknown function: ${fn}`);
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid mathematical expression syntax');
    }

    return stack[0];
  }

  /**
   * Safely calculates a full expression string without eval()
   * @param {string} expr 
   * @returns {number}
   */
  calculateExpression(expr) {
    if (!expr || expr.trim() === '') return 0;

    // Automatically balance unclosed parentheses at the end of expression
    let openCount = 0;
    for (let char of expr) {
      if (char === '(') openCount++;
      if (char === ')') openCount--;
    }
    let balanced = expr;
    while (openCount > 0) {
      balanced += ')';
      openCount--;
    }

    const tokens = this.tokenize(balanced);
    if (tokens.length === 0) return 0;
    const rpn = this.shuntingYard(tokens);
    const result = this.evaluateRPN(rpn);

    if (!isFinite(result)) {
      throw new Error('Calculation resulted in infinity or undefined value');
    }

    return result;
  }

  /**
   * Formats a raw number to prevent standard IEEE 754 floating-point inaccuracies
   * and displays large/small numbers in clear scientific notation.
   * @param {number} num 
   * @returns {string}
   */
  formatResult(num) {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    // Eliminate negative zero (-0 -> 0)
    if (Object.is(num, -0) || Math.abs(num) < 1e-15) {
      return '0';
    }

    const abs = Math.abs(num);

    // Exponential notation for extreme numbers
    if (abs >= 1e14 || (abs < 1e-7 && abs > 0)) {
      const expStr = num.toExponential(10);
      // Clean unnecessary trailing zeros in mantissa
      const parts = expStr.split('e');
      const mantissa = parseFloat(parts[0]).toString();
      return `${mantissa}e${parts[1]}`;
    }

    // Round to 12 significant digits to remove 0.1 + 0.2 = 0.30000000000000004
    const precisionStr = Number(num.toPrecision(12)).toString();
    return precisionStr;
  }

  // ==========================================
  // CALCULATOR USER ACTIONS & KEYPAD HANDLERS
  // ==========================================

  /**
   * Appends a digit (0-9)
   * @param {string} digit 
   */
  inputDigit(digit) {
    if (this.isResultState) {
      // New calculation starts if digit entered after '='
      this.expression = '';
      this.displayValue = digit;
      this.isResultState = false;
    } else {
      if (this.displayValue === '0') {
        this.displayValue = digit;
      } else {
        this.displayValue += digit;
      }
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playNumber();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`${digit} entered.`);
    }
    this.updateUI();
  }

  /**
   * Appends decimal point
   */
  inputDecimal() {
    if (this.isResultState) {
      this.expression = '';
      this.displayValue = '0.';
      this.isResultState = false;
    } else {
      // Find the current trailing number chunk
      const parts = this.displayValue.split(/[\+\−\×\÷\*\/\^\(\),]/);
      const currentSegment = parts[parts.length - 1];
      if (!currentSegment.includes('.')) {
        this.displayValue += currentSegment === '' ? '0.' : '.';
      }
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playNumber();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce('Decimal point.');
    }
    this.updateUI();
  }

  /**
   * Handles binary operators (+, −, ×, ÷, ^, %)
   * @param {string} op 
   */
  inputOperator(op) {
    const visualOpMap = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷',
      '^': '^',
      '%': '%'
    };
    const visualOp = visualOpMap[op] || op;

    if (this.isResultState) {
      this.expression = this.displayValue + ' ' + visualOp + ' ';
      this.displayValue = this.displayValue + ' ' + visualOp + ' ';
      this.isResultState = false;
    } else {
      const trimmed = this.displayValue.trim();
      // If trailing character is already an operator, replace it
      if (/[\+\−\×\÷\^\%]$/.test(trimmed)) {
        this.displayValue = trimmed.slice(0, -1) + visualOp + ' ';
      } else {
        this.displayValue = trimmed + ' ' + visualOp + ' ';
      }
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playOperator();
    if (window.accessibilityManager) {
      const name = window.accessibilityManager.getAccessibleName(op);
      window.accessibilityManager.announce(`${name} selected.`);
    }
    this.updateUI();
  }

  /**
   * Handles scientific function insertion (e.g., sin, cos, sqrt, ln)
   * @param {string} fn 
   */
  inputFunction(fn) {
    let funcToInsert = fn;

    // Handle 2nd / Inverse transformations
    if (this.isInverseMode) {
      const inverseMap = {
        'sin': 'asin',
        'cos': 'acos',
        'tan': 'atan',
        'csc': 'acsc',
        'sec': 'asec',
        'cot': 'acot',
        'sqr': 'sqrt',
        'cube': 'cbrt',
        'pow10': 'log10',
        'exp': 'ln',
        'pow2': 'log2'
      };
      if (inverseMap[fn]) funcToInsert = inverseMap[fn];
    }

    // Handle Hyperbolic transformations
    if (this.isHyperbolic) {
      const hypMap = {
        'sin': 'sinh',
        'cos': 'cosh',
        'tan': 'tanh',
        'csc': 'csch',
        'sec': 'sech',
        'cot': 'coth',
        'asin': 'asinh',
        'acos': 'acosh',
        'atan': 'atanh',
        'acsc': 'acsch',
        'asec': 'asech',
        'acot': 'acoth'
      };
      if (hypMap[funcToInsert]) funcToInsert = hypMap[funcToInsert];
    }

    // Wrap or append function call
    if (this.isResultState) {
      this.displayValue = `${funcToInsert}(${this.displayValue})`;
      this.expression = this.displayValue;
      this.isResultState = false;
    } else {
      if (this.displayValue === '0') {
        this.displayValue = `${funcToInsert}(`;
      } else {
        const lastChar = this.displayValue.trim().slice(-1);
        if (/[\d\)]/.test(lastChar)) {
          this.displayValue += ` × ${funcToInsert}(`;
        } else {
          this.displayValue += `${funcToInsert}(`;
        }
      }
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playScientific();
    if (window.accessibilityManager) {
      const name = window.accessibilityManager.getAccessibleName(funcToInsert);
      window.accessibilityManager.announce(`${name} function selected.`);
    }
    this.updateUI();
  }

  /**
   * Handles mathematical constants (pi, e, tau, phi)
   * @param {string} constant 
   */
  inputConstant(constant) {
    const symbolMap = {
      'pi': 'π',
      'e': 'e',
      'tau': 'τ',
      'phi': 'φ'
    };
    const symbol = symbolMap[constant] || constant;

    if (this.isResultState) {
      this.displayValue = symbol;
      this.expression = symbol;
      this.isResultState = false;
    } else {
      if (this.displayValue === '0') {
        this.displayValue = symbol;
      } else {
        const lastChar = this.displayValue.trim().slice(-1);
        if (/[\d\)]/.test(lastChar)) {
          this.displayValue += ` × ${symbol}`;
        } else {
          this.displayValue += symbol;
        }
      }
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playScientific();
    if (window.accessibilityManager) {
      const name = window.accessibilityManager.getAccessibleName(constant);
      window.accessibilityManager.announce(`${name} constant entered.`);
    }
    this.updateUI();
  }

  /**
   * Handles parentheses and argument separator comma
   * @param {'(' | ')' | ','} paren 
   */
  inputParenthesis(paren) {
    if (this.isResultState) {
      if (paren === '(') {
        this.displayValue = '(';
        this.expression = '(';
      } else {
        this.displayValue += paren;
      }
      this.isResultState = false;
    } else {
      if (this.displayValue === '0' && paren === '(') {
        this.displayValue = '(';
      } else {
        this.displayValue += paren;
      }
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playOperator();
    if (window.accessibilityManager) {
      const name = paren === '(' ? 'Open parenthesis' : (paren === ')' ? 'Close parenthesis' : 'Comma separator');
      window.accessibilityManager.announce(name);
    }
    this.updateUI();
  }

  /**
   * Toggles positive/negative sign of current entry
   */
  toggleSign() {
    if (this.displayValue === '0') return;

    // If starting with negative, remove; otherwise prepend
    if (this.displayValue.startsWith('-')) {
      this.displayValue = this.displayValue.substring(1);
    } else {
      this.displayValue = '-' + this.displayValue;
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playOperator();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce('Sign changed.');
    }
    this.updateUI();
  }

  /**
   * Factorial shortcut '!'
   */
  inputFactorial() {
    if (this.displayValue === '0') {
      this.displayValue = '0!';
    } else {
      this.displayValue += '!';
    }
    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playScientific();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce('Factorial.');
    }
    this.updateUI();
  }

  /**
   * Percentage calculation
   */
  inputPercentage() {
    try {
      const currentVal = this.calculateExpression(this.displayValue);
      const pct = currentVal / 100;
      this.displayValue = this.formatResult(pct);
      this.expression = `${currentVal}%`;
      this.isResultState = true;
      if (window.audioFeedback) window.audioFeedback.playOperator();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(`Percentage result is ${this.displayValue}.`);
      }
      this.updateUI();
    } catch (err) {
      this.handleError(err.message);
    }
  }

  /**
   * Clear Entry (CE) - Clears current line without resetting entire expression
   */
  clearEntry() {
    this.displayValue = '0';
    if (window.audioFeedback) window.audioFeedback.playClear();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce('Current entry cleared.');
    }
    this.updateUI();
  }

  /**
   * All Clear (AC) - Resets calculator display and current expression
   */
  allClear() {
    this.expression = '';
    this.displayValue = '0';
    this.isResultState = false;
    this.isFractionMode = false;
    this.fractionString = '';
    this.originalDecimalValue = null;
    this.baseNumericValue = null;
    if (window.audioFeedback) window.audioFeedback.playClear();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce('All cleared, calculator is zero.');
    }
    this.updateUI();
  }

  /**
   * Backspace (DEL) - Intelligent token-aware deletion with explicit speech announcement
   * Identifies exactly what character, function, or operator was removed and speaks it.
   */
  backspace() {
    if (this.isResultState) {
      this.allClear();
      if (window.audioFeedback) window.audioFeedback.playClear();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce('Result cleared. Calculator is zero.');
      }
      return;
    }

    let val = this.displayValue;
    if (!val || val === '0' || val.trim() === '') {
      if (window.audioFeedback) window.audioFeedback.playBackspace();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce('Nothing to delete. Calculator is zero.');
      }
      return;
    }

    val = val.trimEnd();
    let removedDesc = '';
    let remaining = '';

    // 1. Check for trailing function call: e.g. "sin(", "sqrt(", "log10(", or preceded by " × sin("
    const fnRegex = /(?:\s*[×\*]\s*)?([a-zA-Z0-9_]+)\($/;
    const fnMatch = val.match(fnRegex);

    if (fnMatch) {
      const fnName = fnMatch[1];
      const accName = (window.accessibilityManager && window.accessibilityManager.getAccessibleName(fnName)) || fnName;
      removedDesc = `${accName} function deleted.`;
      remaining = val.substring(0, fnMatch.index);
    } else {
      // 2. Check for trailing binary operator with spacing: e.g. " + ", " − ", " × ", " ÷ ", " ^ ", " % "
      const opRegex = /\s*([\+\−\×\÷\*\/\^\%])\s*$/;
      const opMatch = val.match(opRegex);

      if (opMatch) {
        const opGlyph = opMatch[1];
        const accName = (window.accessibilityManager && window.accessibilityManager.getAccessibleName(opGlyph)) || opGlyph;
        removedDesc = `${accName} deleted.`;
        remaining = val.substring(0, opMatch.index);
      } else {
        // 3. Check for trailing constants: π, e, τ, φ
        const constRegex = /(?:\s*[×\*]\s*)?([πeτφ]|pi|tau|phi)$/i;
        const constMatch = val.match(constRegex);

        if (constMatch) {
          const constName = constMatch[1];
          const accName = (window.accessibilityManager && window.accessibilityManager.getAccessibleName(constName)) || constName;
          removedDesc = `${accName} deleted.`;
          remaining = val.substring(0, constMatch.index);
        } else {
          // 4. Single character deletion (digits, parentheses, punctuation, decimals)
          const lastChar = val.slice(-1);
          remaining = val.slice(0, -1);

          if (lastChar >= '0' && lastChar <= '9') {
            removedDesc = `${lastChar} deleted.`;
          } else if (lastChar === '.') {
            removedDesc = 'Decimal point deleted.';
          } else if (lastChar === '(') {
            removedDesc = 'Open parenthesis deleted.';
          } else if (lastChar === ')') {
            removedDesc = 'Close parenthesis deleted.';
          } else if (lastChar === '!') {
            removedDesc = 'Factorial deleted.';
          } else if (lastChar === ',') {
            removedDesc = 'Comma separator deleted.';
          } else if (lastChar === '-') {
            removedDesc = 'Minus sign deleted.';
          } else {
            removedDesc = `${lastChar} deleted.`;
          }
        }
      }
    }

    remaining = remaining.trimEnd();
    if (remaining === '' || remaining === '-') {
      this.displayValue = '0';
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(`${removedDesc} Calculator is zero.`);
      }
    } else {
      this.displayValue = remaining;
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(`${removedDesc} Current value: ${this.displayValue}`);
      }
    }

    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playBackspace();
    this.updateUI();
  }

  /**
   * Reads current display aloud to screen reader without mutating state
   */
  readCurrentDisplay() {
    let msg = `Current display value is ${this.displayValue}.`;
    if (this.isFractionMode && this.fractionString) {
      msg = `Current display is fraction: ${this.fractionString}.`;
    }
    if (window.audioFeedback) window.audioFeedback.playInspect();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(msg);
    }
  }

  /**
   * Reads current formula expression aloud to screen reader
   */
  readCurrentFormula() {
    const expr = this.expression || this.displayValue;
    const msg = expr ? `Current formula is ${expr}.` : 'Current formula is empty.';
    if (window.audioFeedback) window.audioFeedback.playInspect();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(msg);
    }
  }

  /**
   * Calculates continuous fraction expansion of a decimal number
   */
  decimalToFraction(val, maxDenominator = 100000) {
    if (isNaN(val) || !isFinite(val)) return null;
    if (Math.abs(val) < 1e-12) return { numerator: 0, denominator: 1, str: '0' };
    const sign = val < 0 ? -1 : 1;
    val = Math.abs(val);

    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = val;
    let iterations = 0;
    do {
      let a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
      iterations++;
    } while (Math.abs(val - h1 / k1) > val * 1e-9 && k1 <= maxDenominator && isFinite(b) && iterations < 30);

    const numerator = sign * h1;
    const denominator = k1;

    let mixedStr = '';
    if (Math.abs(numerator) > denominator && denominator > 1) {
      const whole = Math.trunc(numerator / denominator);
      const rem = Math.abs(numerator % denominator);
      mixedStr = ` (${whole} ${rem}/${denominator})`;
    }

    return {
      numerator,
      denominator,
      str: `${numerator}/${denominator}${mixedStr}`
    };
  }

  /**
   * Toggles between Decimal and Exact Fraction representation
   */
  toggleFraction() {
    try {
      let currentVal;
      if (this.isFractionMode) {
        // Toggle back to decimal
        currentVal = (this.originalDecimalValue !== null && this.originalDecimalValue !== undefined)
          ? this.originalDecimalValue
          : this.calculateExpression(this.fractionString || this.displayValue);
        this.isFractionMode = false;
        this.originalDecimalValue = null;
        this.displayValue = this.formatResult(currentVal);
        if (window.audioFeedback) window.audioFeedback.playConvert();
        if (window.accessibilityManager) {
          window.accessibilityManager.announce(`Decimal representation is ${this.displayValue}.`);
        }
      } else {
        // Convert to fraction
        if (this.displayValue.includes('/')) {
          currentVal = this.calculateExpression(this.displayValue);
        } else {
          currentVal = parseFloat(this.displayValue);
          if (isNaN(currentVal)) {
            currentVal = this.calculateExpression(this.displayValue);
          }
        }

        const frac = this.decimalToFraction(currentVal);
        if (frac && frac.denominator > 1) {
          this.isFractionMode = true;
          this.originalDecimalValue = currentVal;
          this.fractionString = frac.str;
          this.displayValue = frac.str;
          if (window.audioFeedback) window.audioFeedback.playConvert();
          if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Fraction representation is ${frac.numerator} over ${frac.denominator}.`);
          }
        } else {
          if (window.audioFeedback) window.audioFeedback.playConvert();
          if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Value ${currentVal} is already an integer.`);
          }
        }
      }
      this.updateUI();
    } catch (e) {
      this.handleError(e.message);
    }
  }

  /**
   * Toggles Engineering Notation (exponents in multiples of 3)
   */
  toggleEngineeringNotation() {
    try {
      let num = parseFloat(this.displayValue);
      if (isNaN(num)) {
        num = this.calculateExpression(this.displayValue);
      }

      if (num === 0 || !isFinite(num)) {
        if (window.accessibilityManager) window.accessibilityManager.announce('Cannot convert zero to engineering notation.');
        return;
      }

      const exp = Math.floor(Math.log10(Math.abs(num)));
      const engExp = Math.floor(exp / 3) * 3;
      const mantissa = num / Math.pow(10, engExp);
      const roundedMantissa = Number(mantissa.toPrecision(6));

      const engStr = engExp === 0 ? `${roundedMantissa}` : `${roundedMantissa} × 10^${engExp}`;
      this.displayValue = engStr;
      this.isResultState = true;

      if (window.audioFeedback) window.audioFeedback.playConvert();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(`Engineering notation is ${engStr}.`);
      }
      this.updateUI();
    } catch (e) {
      this.handleError(e.message);
    }
  }

  /**
   * Cycles number base between DEC, HEX, BIN, and OCT
   */
  cycleBaseMode() {
    const bases = ['DEC', 'HEX', 'BIN', 'OCT'];
    const nextIdx = (bases.indexOf(this.baseMode) + 1) % bases.length;
    this.baseMode = bases[nextIdx];

    try {
      let intVal;
      if (this.baseNumericValue !== null && this.baseNumericValue !== undefined) {
        intVal = this.baseNumericValue;
      } else {
        let num = Number(this.displayValue);
        if (isNaN(num)) num = parseFloat(this.displayValue);
        if (isNaN(num)) num = this.calculateExpression(this.displayValue);
        intVal = Math.trunc(num);
      }
      this.baseNumericValue = intVal;

      let converted = '';
      let spokenName = '';
      switch (this.baseMode) {
        case 'HEX':
          converted = (intVal >>> 0).toString(16).toUpperCase();
          spokenName = `Hexadecimal value: ${converted}`;
          break;
        case 'BIN':
          converted = (intVal >>> 0).toString(2);
          spokenName = `Binary value: ${converted}`;
          break;
        case 'OCT':
          converted = (intVal >>> 0).toString(8);
          spokenName = `Octal value: ${converted}`;
          break;
        default:
          converted = String(intVal);
          spokenName = `Decimal value: ${converted}`;
          this.baseNumericValue = null;
          break;
      }

      this.displayValue = converted;
      this.isResultState = true;
      if (window.audioFeedback) window.audioFeedback.playConvert();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(spokenName);
      }
      this.updateUI();
    } catch (e) {
      this.handleError(e.message);
    }
  }

  /**
   * Inserts a physical scientific constant by id (c, h, G, Na, etc.)
   */
  insertPhysicalConstant(id) {
    const constant = this.PHYSICAL_CONSTANTS.find(c => c.id === id);
    if (!constant) return;

    const valStr = String(constant.value);
    if (this.isResultState) {
      this.displayValue = valStr;
      this.expression = constant.symbol;
      this.isResultState = false;
    } else {
      if (this.displayValue === '0') {
        this.displayValue = valStr;
      } else {
        const lastChar = this.displayValue.trim().slice(-1);
        if (/[\d\)]/.test(lastChar)) {
          this.displayValue += ` × ${valStr}`;
        } else {
          this.displayValue += valStr;
        }
      }
    }
    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playScientific();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`${constant.name} constant, value ${valStr} inserted.`);
    }
    this.updateUI();
  }

  /**
   * Computes comprehensive descriptive statistics for an array of numbers
   */
  calculateStats(arr) {
    const valid = arr.map(Number).filter(n => !isNaN(n) && isFinite(n));
    if (valid.length === 0) throw new Error('No valid numbers provided');

    const n = valid.length;
    const sum = valid.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const sumSqDiff = valid.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
    const sumSq = valid.reduce((acc, x) => acc + x * x, 0);

    const variance = n > 1 ? sumSqDiff / (n - 1) : 0;
    const popVariance = sumSqDiff / n;
    const sampleStdDev = Math.sqrt(variance);
    const popStdDev = Math.sqrt(popVariance);

    const sorted = [...valid].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return {
      count: n,
      sum: this.formatResult(sum),
      rawSum: sum,
      sumSquares: this.formatResult(sumSq),
      mean: this.formatResult(mean),
      rawMean: mean,
      median: this.formatResult(median),
      rawMedian: median,
      min: this.formatResult(min),
      rawMin: min,
      max: this.formatResult(max),
      rawMax: max,
      range: this.formatResult(range),
      rawRange: range,
      sampleStdDev: this.formatResult(sampleStdDev),
      rawSampleStdDev: sampleStdDev,
      popStdDev: this.formatResult(popStdDev),
      populationStdDev: this.formatResult(popStdDev),
      rawPopulationStdDev: popStdDev,
      sampleVariance: this.formatResult(variance),
      populationVariance: this.formatResult(popVariance)
    };
  }

  /**
   * Synchronizes expression preview from current display value
   */
  updateExpressionFromDisplay() {
    this.expression = this.displayValue;
  }

  /**
   * Evaluates the current expression when '=' is pressed
   */
  calculate() {
    const rawExpr = this.displayValue;
    if (!rawExpr || rawExpr.trim() === '') return;

    try {
      const result = this.calculateExpression(rawExpr);
      const formattedResult = this.formatResult(result);

      // Record in calculation history
      this.addToHistory(rawExpr, formattedResult);

      this.previousResult = formattedResult;
      this.expression = `${rawExpr} =`;
      this.displayValue = formattedResult;
      this.isResultState = true;

      if (window.audioFeedback) window.audioFeedback.playCalculationComplete();
      if (window.accessibilityManager) {
        window.accessibilityManager.announceResult(formattedResult);
      }

      this.updateUI();
    } catch (err) {
      this.handleError(err.message);
    }
  }

  /**
   * Handles calculation and syntax errors gracefully
   * @param {string} message 
   */
  handleError(message) {
    this.displayValue = 'Error';
    this.expression = message;
    this.isResultState = true;

    if (window.audioFeedback) window.audioFeedback.playError();
    if (window.accessibilityManager) {
      window.accessibilityManager.announceError(`Error: ${message}`);
    }

    this.updateUI();
  }

  /**
   * Recalls the previous calculation result (Ans button)
   */
  recallPreviousAnswer() {
    if (this.previousResult !== null && this.previousResult !== undefined) {
      this.displayValue = String(this.previousResult);
      this.isResultState = true;
      this.updateUI();
      if (window.audioFeedback) window.audioFeedback.playMemory();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(`Previous answer ${this.displayValue} recalled.`);
      }
    } else {
      if (window.audioFeedback) window.audioFeedback.playError();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce('No previous answer available.');
      }
    }
  }

  // ==========================================
  // MEMORY FUNCTIONS (MC, MR, M+, M-, MS)
  // ==========================================

  memoryClear() {
    this.memoryValue = 0;
    this.saveState();
    if (window.audioFeedback) window.audioFeedback.playMemory();
    if (window.accessibilityManager) window.accessibilityManager.announce('Memory cleared.');
    this.updateUI();
  }

  memoryRecall() {
    const formatted = this.formatResult(this.memoryValue);
    if (this.isResultState) {
      this.displayValue = formatted;
      this.expression = '';
      this.isResultState = false;
    } else {
      if (this.displayValue === '0') {
        this.displayValue = formatted;
      } else {
        const lastChar = this.displayValue.trim().slice(-1);
        if (/[\d\)]/.test(lastChar)) {
          this.displayValue += ` × ${formatted}`;
        } else {
          this.displayValue += formatted;
        }
      }
    }
    this.updateExpressionFromDisplay();
    if (window.audioFeedback) window.audioFeedback.playMemory();
    if (window.accessibilityManager) window.accessibilityManager.announce(`Memory recalled: ${formatted}.`);
    this.updateUI();
  }

  memoryStore() {
    try {
      const current = this.calculateExpression(this.displayValue);
      this.memoryValue = current;
      this.saveState();
      if (window.audioFeedback) window.audioFeedback.playMemory();
      if (window.accessibilityManager) window.accessibilityManager.announce(`Stored in memory: ${this.formatResult(current)}.`);
      this.updateUI();
    } catch (e) {
      this.handleError(e.message);
    }
  }

  memoryAdd() {
    try {
      const current = this.calculateExpression(this.displayValue);
      this.memoryValue += current;
      this.saveState();
      if (window.audioFeedback) window.audioFeedback.playMemory();
      if (window.accessibilityManager) window.accessibilityManager.announce(`Added to memory. New memory is ${this.formatResult(this.memoryValue)}.`);
      this.updateUI();
    } catch (e) {
      this.handleError(e.message);
    }
  }

  memorySubtract() {
    try {
      const current = this.calculateExpression(this.displayValue);
      this.memoryValue -= current;
      this.saveState();
      if (window.audioFeedback) window.audioFeedback.playMemory();
      if (window.accessibilityManager) window.accessibilityManager.announce(`Subtracted from memory. New memory is ${this.formatResult(this.memoryValue)}.`);
      this.updateUI();
    } catch (e) {
      this.handleError(e.message);
    }
  }

  // ==========================================
  // HISTORY MANAGEMENT
  // ==========================================

  addToHistory(expr, result) {
    const item = {
      id: Date.now().toString(),
      expression: expr,
      result: result,
      angleMode: this.angleMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.history.unshift(item);
    if (this.history.length > 50) this.history.pop();
    this.saveState();
    this.renderHistory();
  }

  clearHistory() {
    this.history = [];
    this.saveState();
    this.renderHistory();
    if (window.audioFeedback) window.audioFeedback.playClear();
    if (window.accessibilityManager) window.accessibilityManager.announce('Calculation history cleared.');
  }

  recallHistoryItem(item) {
    this.displayValue = item.result;
    this.expression = `${item.expression} =`;
    this.isResultState = true;
    if (window.audioFeedback) window.audioFeedback.playNumber();
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`Recalled from history: ${item.expression} equals ${item.result}.`);
    }
    this.updateUI();
  }

  renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;

    if (this.history.length === 0) {
      container.innerHTML = '<li class="history-empty" role="status">No previous calculations in history.</li>';
      return;
    }

    container.innerHTML = '';
    this.history.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const recallBtn = document.createElement('button');
      recallBtn.type = 'button';
      recallBtn.className = 'history-recall-btn';
      recallBtn.setAttribute('aria-label', `Recall calculation: ${item.expression} equals ${item.result}`);
      recallBtn.innerHTML = `
        <span class="history-expr">${this.escapeHTML(item.expression)}</span>
        <span class="history-eq">=</span>
        <span class="history-res">${this.escapeHTML(item.result)}</span>
        <span class="history-meta">${item.angleMode} &bull; ${item.timestamp}</span>
      `;
      recallBtn.addEventListener('click', () => {
        this.recallHistoryItem(item);
      });

      li.appendChild(recallBtn);
      container.appendChild(li);
    });
  }

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Copies current displayed value to clipboard
   */
  async copyResult() {
    const textToCopy = this.displayValue;
    if (!textToCopy || textToCopy === 'Error') return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (window.audioFeedback) window.audioFeedback.playScientific();
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(`Copied ${textToCopy} to clipboard.`);
      }

      const copyBtn = document.getElementById('btn-copy-result');
      if (copyBtn) {
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 1500);
      }
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  }

  // ==========================================
  // UI & DISPLAY SYNCHRONIZATION
  // ==========================================

  updateUI() {
    const exprEl = document.getElementById('calc-expression');
    const displayEl = document.getElementById('calc-display');
    const memoryIndicator = document.getElementById('calc-memory-indicator');
    const modeIndicator = document.getElementById('calc-angle-indicator');
    const invBtn = document.getElementById('btn-inv');
    const hypBtn = document.getElementById('btn-hyp');

    if (exprEl) {
      exprEl.textContent = this.expression || '';
      exprEl.setAttribute('aria-label', this.expression ? `Formula expression: ${this.expression}` : 'Formula expression: empty');
    }

    if (displayEl) {
      displayEl.textContent = this.displayValue || '0';
      const spokenValue = this.displayValue || '0';
      const label = this.isResultState 
        ? `Result: ${spokenValue}` 
        : `Current display value: ${spokenValue}`;
      displayEl.setAttribute('aria-label', label);
    }

    if (memoryIndicator) {
      if (this.memoryValue !== 0) {
        memoryIndicator.classList.add('active');
        memoryIndicator.setAttribute('aria-label', `Memory active: ${this.formatResult(this.memoryValue)}`);
      } else {
        memoryIndicator.classList.remove('active');
        memoryIndicator.setAttribute('aria-label', 'Memory empty');
      }
    }

    if (modeIndicator) {
      modeIndicator.textContent = this.angleMode;
      modeIndicator.setAttribute('aria-label', `Active angle mode: ${this.angleMode}`);
    }

    const baseIndicator = document.getElementById('calc-base-indicator');
    if (baseIndicator) {
      baseIndicator.textContent = this.baseMode;
      baseIndicator.setAttribute('aria-label', `Current number base: ${this.baseMode}`);
    }

    const fracBtn = document.getElementById('btn-frac');
    if (fracBtn) {
      fracBtn.classList.toggle('active', this.isFractionMode);
      fracBtn.setAttribute('aria-pressed', String(this.isFractionMode));
    }

    // Toggle 2nd/Inverse button visual states and labels
    if (invBtn) {
      invBtn.setAttribute('aria-pressed', String(this.isInverseMode));
      invBtn.classList.toggle('active', this.isInverseMode);
    }

    if (hypBtn) {
      hypBtn.setAttribute('aria-pressed', String(this.isHyperbolic));
      hypBtn.classList.toggle('active', this.isHyperbolic);
    }

    // Update dynamic button labels when 2nd or Hyp is active
    this.updateKeypadLabels();
  }

  /**
   * Updates visual button labels and aria-labels when Inverse or Hyperbolic modes are toggled
   */
  updateKeypadLabels() {
    const sinBtn = document.querySelector('[data-action="sin"]');
    const cosBtn = document.querySelector('[data-action="cos"]');
    const tanBtn = document.querySelector('[data-action="tan"]');
    const cscBtn = document.querySelector('[data-action="csc"]');
    const secBtn = document.querySelector('[data-action="sec"]');
    const cotBtn = document.querySelector('[data-action="cot"]');
    const sqrBtn = document.querySelector('[data-action="sqr"]');
    const lnBtn = document.querySelector('[data-action="ln"]');
    const logBtn = document.querySelector('[data-action="log"]');

    if (!sinBtn || !cosBtn || !tanBtn) return;

    if (this.isHyperbolic && this.isInverseMode) {
      sinBtn.innerHTML = 'asinh';
      sinBtn.setAttribute('aria-label', 'Inverse hyperbolic sine');
      cosBtn.innerHTML = 'acosh';
      cosBtn.setAttribute('aria-label', 'Inverse hyperbolic cosine');
      tanBtn.innerHTML = 'atanh';
      tanBtn.setAttribute('aria-label', 'Inverse hyperbolic tangent');
      if (cscBtn) {
        cscBtn.innerHTML = 'acsch';
        cscBtn.setAttribute('aria-label', 'Inverse hyperbolic cosecant');
      }
      if (secBtn) {
        secBtn.innerHTML = 'asech';
        secBtn.setAttribute('aria-label', 'Inverse hyperbolic secant');
      }
      if (cotBtn) {
        cotBtn.innerHTML = 'acoth';
        cotBtn.setAttribute('aria-label', 'Inverse hyperbolic cotangent');
      }
    } else if (this.isHyperbolic) {
      sinBtn.innerHTML = 'sinh';
      sinBtn.setAttribute('aria-label', 'Hyperbolic sine');
      cosBtn.innerHTML = 'cosh';
      cosBtn.setAttribute('aria-label', 'Hyperbolic cosine');
      tanBtn.innerHTML = 'tanh';
      tanBtn.setAttribute('aria-label', 'Hyperbolic tangent');
      if (cscBtn) {
        cscBtn.innerHTML = 'csch';
        cscBtn.setAttribute('aria-label', 'Hyperbolic cosecant');
      }
      if (secBtn) {
        secBtn.innerHTML = 'sech';
        secBtn.setAttribute('aria-label', 'Hyperbolic secant');
      }
      if (cotBtn) {
        cotBtn.innerHTML = 'coth';
        cotBtn.setAttribute('aria-label', 'Hyperbolic cotangent');
      }
    } else if (this.isInverseMode) {
      sinBtn.innerHTML = 'sin⁻¹';
      sinBtn.setAttribute('aria-label', 'Inverse sine');
      cosBtn.innerHTML = 'cos⁻¹';
      cosBtn.setAttribute('aria-label', 'Inverse cosine');
      tanBtn.innerHTML = 'tan⁻¹';
      tanBtn.setAttribute('aria-label', 'Inverse tangent');
      if (cscBtn) {
        cscBtn.innerHTML = 'csc⁻¹';
        cscBtn.setAttribute('aria-label', 'Inverse cosecant');
      }
      if (secBtn) {
        secBtn.innerHTML = 'sec⁻¹';
        secBtn.setAttribute('aria-label', 'Inverse secant');
      }
      if (cotBtn) {
        cotBtn.innerHTML = 'cot⁻¹';
        cotBtn.setAttribute('aria-label', 'Inverse cotangent');
      }
    } else {
      sinBtn.innerHTML = 'sin';
      sinBtn.setAttribute('aria-label', 'Sine');
      cosBtn.innerHTML = 'cos';
      cosBtn.setAttribute('aria-label', 'Cosine');
      tanBtn.innerHTML = 'tan';
      tanBtn.setAttribute('aria-label', 'Tangent');
      if (cscBtn) {
        cscBtn.innerHTML = 'csc';
        cscBtn.setAttribute('aria-label', 'Cosecant');
      }
      if (secBtn) {
        secBtn.innerHTML = 'sec';
        secBtn.setAttribute('aria-label', 'Secant');
      }
      if (cotBtn) {
        cotBtn.innerHTML = 'cot';
        cotBtn.setAttribute('aria-label', 'Cotangent');
      }
    }

    if (sqrBtn) {
      if (this.isInverseMode) {
        sqrBtn.innerHTML = '√x';
        sqrBtn.setAttribute('aria-label', 'Square root');
      } else {
        sqrBtn.innerHTML = 'x²';
        sqrBtn.setAttribute('aria-label', 'Square, x squared');
      }
    }

    if (lnBtn) {
      if (this.isInverseMode) {
        lnBtn.innerHTML = 'eˣ';
        lnBtn.setAttribute('aria-label', 'Exponential e to the power x');
      } else {
        lnBtn.innerHTML = 'ln';
        lnBtn.setAttribute('aria-label', 'Natural logarithm');
      }
    }

    if (logBtn) {
      if (this.isInverseMode) {
        logBtn.innerHTML = '10ˣ';
        logBtn.setAttribute('aria-label', '10 to the power x');
      } else {
        logBtn.innerHTML = 'log';
        logBtn.setAttribute('aria-label', 'Common logarithm base 10');
      }
    }
  }

  // ==========================================
  // KEYBOARD SHORTCUTS DISPATCHER
  // ==========================================

  handleKeyDown(e) {
    if (!e || e.defaultPrevented) return;

    // If modal is active, do not intercept calculator keys
    if (window.accessibilityManager && window.accessibilityManager.activeModal) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        window.accessibilityManager.closeModal(window.accessibilityManager.activeModal);
      }
      return;
    }

    // If user is inside an input or editable field in settings/dialogs, allow standard editing
    if (e.target && e.target.tagName && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName.toUpperCase())) {
      return;
    }

    // 1. EQUALS & ENTER (Calculate result)
    // Supports: 'Enter', '=', NumpadEnter, and upper-row Equal key (with or without Shift)
    if (
      e.key === 'Enter' ||
      e.key === '=' ||
      e.code === 'NumpadEnter' ||
      (e.code === 'Equal' && !e.shiftKey)
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      this.calculate();
      return;
    }

    // 2. NUMBER KEYS 0-9
    // Supports:
    // - Direct e.key ('0'-'9')
    // - Upper row keys (e.code 'Digit0' through 'Digit9')
    // - Numpad keys (e.code 'Numpad0' through 'Numpad9')
    // - International layouts (e.g. French AZERTY where Shift + Upper Row types numbers)
    let digit = null;
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      if (e.key >= '0' && e.key <= '9' && !e.shiftKey) {
        digit = e.key;
      } else if (e.code && /^Digit([0-9])$/.test(e.code) && !e.shiftKey) {
        // Upper keyboard row (Digit0 - Digit9)
        digit = e.code.match(/^Digit([0-9])$/)[1];
      } else if (e.code && /^Numpad([0-9])$/.test(e.code)) {
        // Numeric keypad (Numpad0 - Numpad9)
        digit = e.code.match(/^Numpad([0-9])$/)[1];
      } else if (e.shiftKey && e.key >= '0' && e.key <= '9') {
        // AZERTY or other keyboards where Shift is needed for upper row digits
        digit = e.key;
      }
    }

    if (digit !== null) {
      e.preventDefault();
      this.inputDigit(digit);
      return;
    }

    // 3. DECIMAL POINT
    if (e.key === '.' || e.code === 'NumpadDecimal' || (e.code === 'Period' && !e.shiftKey)) {
      e.preventDefault();
      this.inputDecimal();
      return;
    }

    // 4. BASIC ARITHMETIC OPERATORS
    if (e.key === '+' || e.code === 'NumpadAdd' || (e.code === 'Equal' && e.shiftKey)) {
      e.preventDefault();
      this.inputOperator('+');
      return;
    }
    if (e.key === '-' || e.code === 'NumpadSubtract' || (e.code === 'Minus' && !e.shiftKey)) {
      e.preventDefault();
      this.inputOperator('-');
      return;
    }
    if (e.key === '*' || e.code === 'NumpadMultiply' || (e.code === 'Digit8' && e.shiftKey)) {
      e.preventDefault();
      this.inputOperator('*');
      return;
    }
    if (e.key === '/' || e.code === 'NumpadDivide' || (e.code === 'Slash' && !e.shiftKey)) {
      e.preventDefault();
      this.inputOperator('/');
      return;
    }
    if (e.key === '^' || (e.code === 'Digit6' && e.shiftKey)) {
      e.preventDefault();
      this.inputOperator('^');
      return;
    }
    if (e.key === '%' || (e.code === 'Digit5' && e.shiftKey)) {
      e.preventDefault();
      this.inputPercentage();
      return;
    }

    // 5. PARENTHESES AND COMMA
    if (e.key === '(' || (e.code === 'Digit9' && e.shiftKey)) {
      e.preventDefault();
      this.inputParenthesis('(');
      return;
    }
    if (e.key === ')' || (e.code === 'Digit0' && e.shiftKey)) {
      e.preventDefault();
      this.inputParenthesis(')');
      return;
    }
    if (e.key === ',' || e.code === 'Comma') {
      e.preventDefault();
      this.inputParenthesis(',');
      return;
    }

    // 6. CLEAR AND EDITING KEYS
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.backspace();
      return;
    }
    if (e.key === 'Delete') {
      e.preventDefault();
      this.clearEntry();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.allClear();
      return;
    }

    // 7. FACTORIAL (!)
    if (e.key === '!' || (e.code === 'Digit1' && e.shiftKey)) {
      e.preventDefault();
      this.inputFactorial();
      return;
    }

    // 7b. DIRECT INVERSE TRIG SHORTCUTS WITH SHIFT
    // (Shift+S: asin, Shift+C: acos, Shift+T: atan, Shift+Z: acsc, Shift+X: asec, Shift+O: acot)
    if (e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const lower = e.key.toLowerCase();
      if (lower === 's') {
        e.preventDefault();
        this.inputFunction('asin');
        return;
      }
      if (lower === 'c') {
        e.preventDefault();
        this.inputFunction('acos');
        return;
      }
      if (lower === 't') {
        e.preventDefault();
        this.inputFunction('atan');
        return;
      }
      if (lower === 'z') {
        e.preventDefault();
        this.inputFunction('acsc');
        return;
      }
      if (lower === 'x') {
        e.preventDefault();
        this.inputFunction('asec');
        return;
      }
      if (lower === 'o') {
        e.preventDefault();
        this.inputFunction('acot');
        return;
      }
    }

    // 8. QUICK SCIENTIFIC SHORTCUTS (sin, cos, tan, ln, log, sqrt, pi, e, 2nd, hyp, read display/formula)
    if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      const lower = e.key.toLowerCase();
      if (lower === 'i') {
        e.preventDefault();
        this.toggleInverseMode();
        return;
      }
      if (lower === 'y') {
        e.preventDefault();
        this.toggleHyperbolicMode();
        return;
      }
      if (lower === 'd') {
        e.preventDefault();
        this.readCurrentDisplay();
        return;
      }
      if (lower === 'f') {
        e.preventDefault();
        this.readCurrentFormula();
        return;
      }
      if (lower === 's') {
        e.preventDefault();
        this.inputFunction('sin');
        return;
      }
      if (lower === 'c') {
        e.preventDefault();
        this.inputFunction('cos');
        return;
      }
      if (lower === 't') {
        e.preventDefault();
        this.inputFunction('tan');
        return;
      }
      if (lower === 'z') {
        e.preventDefault();
        this.inputFunction('csc');
        return;
      }
      if (lower === 'x') {
        e.preventDefault();
        this.inputFunction('sec');
        return;
      }
      if (lower === 'o') {
        e.preventDefault();
        this.inputFunction('cot');
        return;
      }
      if (lower === 'l') {
        e.preventDefault();
        this.inputFunction('ln');
        return;
      }
      if (lower === 'g') {
        e.preventDefault();
        this.inputFunction('log');
        return;
      }
      if (lower === 'r') {
        e.preventDefault();
        this.inputFunction('sqrt');
        return;
      }
      if (lower === 'p') {
        e.preventDefault();
        this.inputConstant('pi');
        return;
      }
      if (lower === 'e') {
        e.preventDefault();
        this.inputConstant('e');
        return;
      }
    }

    // 9. ALT KEY SHORTCUTS
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const lower = e.key.toLowerCase();
      if (lower === 'i') {
        e.preventDefault();
        this.toggleInverseMode();
        return;
      }
      if (lower === 'y') {
        e.preventDefault();
        this.toggleHyperbolicMode();
        return;
      }
      if (lower === 'z') {
        e.preventDefault();
        this.inputFunction('csc');
        return;
      }
      if (lower === 'x') {
        e.preventDefault();
        this.inputFunction('sec');
        return;
      }
      if (lower === 'o') {
        e.preventDefault();
        this.inputFunction('cot');
        return;
      }
      if (lower === 'd') {
        e.preventDefault();
        this.readCurrentDisplay();
        return;
      }
      if (lower === 'f') {
        e.preventDefault();
        this.readCurrentFormula();
        return;
      }
      if (lower === 'c') {
        e.preventDefault();
        const constBtn = document.getElementById('btn-open-constants');
        if (constBtn) constBtn.click();
        return;
      }
      if (lower === 't') {
        e.preventDefault();
        const statsBtn = document.getElementById('btn-open-stats');
        if (statsBtn) statsBtn.click();
        return;
      }
      if (lower === 'b') {
        e.preventDefault();
        this.cycleBaseMode();
        return;
      }
      if (lower === 'e') {
        e.preventDefault();
        this.toggleEngineeringNotation();
        return;
      }
      if (lower === 'n') {
        e.preventDefault();
        this.toggleFraction();
        return;
      }
      if (lower === 'm') {
        e.preventDefault();
        this.toggleAngleMode();
        return;
      }
      if (lower === 'h') {
        e.preventDefault();
        const historyBtn = document.getElementById('btn-open-history');
        if (historyBtn) historyBtn.click();
        return;
      }
      if (lower === 's') {
        e.preventDefault();
        const settingsBtn = document.getElementById('btn-open-settings');
        if (settingsBtn) settingsBtn.click();
        return;
      }
    }

    // 10. F1 or ? FOR HELP MODAL
    if (e.key === 'F1' || e.key === '?') {
      e.preventDefault();
      const helpBtn = document.getElementById('btn-open-help');
      if (helpBtn) helpBtn.click();
      return;
    }
  }
}

// Global instance
window.calculator = new ScientificCalculator();
