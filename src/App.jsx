// ============================================================
// CALC2PRO — Calculus II Study Platform
// Run: npm install firebase  then  npm run dev
// Deploy: push to GitHub → import on vercel.com
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

// Firebase imports (requires: npm install firebase)
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

// ============================================================
// FIREBASE CONFIG
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAUMwusWfdjlBB810KfdAlRHn_m71QX3a0",
  authDomain: "calc2pro.firebaseapp.com",
  projectId: "calc2pro",
  storageBucket: "calc2pro.firebasestorage.app",
  messagingSenderId: "582209166119",
  appId: "1:582209166119:web:b481f2791dee451d9ee702",
  measurementId: "G-C7CF82ZJ6G",
};

const _app = initializeApp(firebaseConfig);
const _auth = getAuth(_app);
const _db = getFirestore(_app);

function getFirebase() {
  return { app: _app, auth: _auth, db: _db };
}

// ============================================================
// DATA
// ============================================================
const UNITS = {
  test1: [
    { id: "5.4", name: "5.4: Indefinite Integrals & Net Change",
      concepts: [
        "An **indefinite integral** represents a family of antiderivatives: ∫f(x)dx = F(x) + C",
        "The **Net Change Theorem**: ∫[a,b] F′(x)dx = F(b) − F(a)",
        "Antiderivative rules reverse differentiation — every derivative rule has a corresponding integration rule",
        "The constant **C** accounts for all possible vertical shifts of the antiderivative",
        "**Displacement** vs **total distance**: displacement = ∫v(t)dt; total distance = ∫|v(t)|dt",
      ],
      formulas: ["∫xⁿ dx = xⁿ⁺¹/(n+1) + C, n ≠ −1","∫eˣ dx = eˣ + C","∫(1/x) dx = ln|x| + C","∫sin(x) dx = −cos(x) + C","∫cos(x) dx = sin(x) + C","∫sec²(x) dx = tan(x) + C","∫kf(x) dx = k∫f(x) dx","∫[f(x) ± g(x)] dx = ∫f(x) dx ± ∫g(x) dx","Net Change: ∫[a,b] F′(x) dx = F(b) − F(a)"],
      graphs: [{ label: "Antiderivative Family", desc: "A family of curves F(x)+C, each shifted vertically" },{ label: "Net Change Area", desc: "Signed area under v(t) from a to b gives displacement" }]
    },
    { id: "5.5", name: "5.5: The Substitution Rule",
      concepts: ["**U-substitution** reverses the chain rule: if u = g(x), then du = g′(x)dx","Choose u to be the **inner function** of a composition","After substituting, the integral must be entirely in terms of u","For **definite integrals**, change limits to u-values or back-substitute","Symmetry: if f is **even**, ∫[−a,a] f = 2∫[0,a] f; if **odd**, = 0"],
      formulas: ["∫f(g(x))g′(x) dx = ∫f(u) du, where u = g(x)","du = g′(x) dx","Definite: ∫[a,b] f(g(x))g′(x) dx = ∫[g(a),g(b)] f(u) du","Even: ∫[−a,a] f(x) dx = 2∫[0,a] f(x) dx","Odd: ∫[−a,a] f(x) dx = 0"],
      graphs: [{ label: "U-Substitution Visualization", desc: "Stretching/compressing the x-axis via u=g(x)" },{ label: "Symmetry on [−a,a]", desc: "Even doubles the [0,a] area; odd cancels to zero" }]
    },
    { id: "6.1", name: "6.1: Areas Between Curves",
      concepts: ["Area = integral of (top − bottom) over [a,b]","Always identify which function is **on top**","Find intersections by setting f(x) = g(x)","For y-integration: use rightmost − leftmost","Split integrals at crossover points"],
      formulas: ["A = ∫[a,b] [f(x) − g(x)] dx, f(x) ≥ g(x)","A = ∫[a,b] |f(x) − g(x)| dx","A = ∫[c,d] [f(y) − g(y)] dy","Set f(x) = g(x) to find intersections"],
      graphs: [{ label: "Vertical Slices (dx)", desc: "Thin vertical rectangles of height [f(x)−g(x)]" },{ label: "Horizontal Slices (dy)", desc: "Used when integrating with respect to y" }]
    },
    { id: "6.2", name: "6.2: Volumes",
      concepts: ["**Disk method**: solid with circular cross-sections","**Washer method**: subtract inner disk from outer disk","V = ∫A(x)dx works for ANY known cross-section","Identify axis of rotation to find R and r","Cross-sections can be squares, triangles, semicircles"],
      formulas: ["Disk (x-axis): V = π∫[a,b] [f(x)]² dx","Washer: V = π∫[a,b] {[R(x)]² − [r(x)]²} dx","Disk (y-axis): V = π∫[c,d] [g(y)]² dy","General: V = ∫[a,b] A(x) dx"],
      graphs: [{ label: "Disk Method", desc: "Stack thin disks of radius f(x) along the axis" },{ label: "Washer Method", desc: "Washer (annulus) with outer R and inner r" }]
    },
    { id: "6.3", name: "6.3: Volumes by Cylindrical Shells",
      concepts: ["**Shell method**: use when disk/washer requires messy y-solving","Peel off a cylindrical shell of radius x, height f(x)","Integrates in the **same variable** as region is described","One shell ≈ 2π·(radius)·(height)·(thickness)","Best when rotating around a vertical axis with f(x)"],
      formulas: ["Shell (y-axis): V = 2π∫[a,b] x·f(x) dx","Shell (x-axis): V = 2π∫[c,d] y·g(y) dy","Shell (x=k): V = 2π∫[a,b] |x−k|·f(x) dx","Shell (y=k): V = 2π∫[c,d] |y−k|·g(y) dy"],
      graphs: [{ label: "Shell Visualization", desc: "Unrolling gives a slab: 2πx by f(x) by dx" },{ label: "Shell vs Washer", desc: "When each method gives a simpler integral" }]
    },
    { id: "7.1", name: "7.1: Integration by Parts",
      concepts: ["IBP reverses the **product rule**: d(uv) = u dv + v du","**LIATE**: Logarithm, Inverse trig, Algebraic, Trig, Exponential","Sometimes must apply IBP **multiple times**","∫eˣsinx dx requires IBP twice then algebraic solving","**Tabular method** speeds up repeated IBP"],
      formulas: ["∫u dv = uv − ∫v du","Choose u via LIATE","∫eˣsin(x) dx = (eˣ/2)(sin x − cos x) + C","∫ln(x) dx = x ln(x) − x + C","∫xⁿln(x) dx = xⁿ⁺¹ln(x)/(n+1) − xⁿ⁺¹/(n+1)² + C"],
      graphs: [{ label: "IBP Geometric Meaning", desc: "Area ∫u dv = rectangle uv minus area ∫v du" }]
    },
    { id: "7.2", name: "7.2: Trigonometric Integrals",
      concepts: ["Use **half-angle identities** to reduce even powers","For ∫sinᵐcosⁿ: if m or n **odd**, save one factor","For ∫tanᵐsecⁿ: if n **even** save sec²; m **odd** save sec·tan","sin²x = (1−cos2x)/2, cos²x = (1+cos2x)/2","Products of different trig: use product-to-sum"],
      formulas: ["sin²x = (1 − cos 2x)/2","cos²x = (1 + cos 2x)/2","tan²x = sec²x − 1","∫tanx dx = ln|sec x| + C","∫secx dx = ln|sec x + tan x| + C","sin A cos B = ½[sin(A−B) + sin(A+B)]"],
      graphs: []
    },
    { id: "7.3", name: "7.3: Trigonometric Substitution",
      concepts: ["Eliminates square roots by converting to trig form","Three cases: a²−x², a²+x², x²−a²","After integrating in θ, convert back via **reference triangle**","Draw triangle to find all trig functions of θ in terms of x","May need completing the square first"],
      formulas: ["√(a²−x²): x = a sinθ, dx = a cosθ dθ","√(a²+x²): x = a tanθ, dx = a sec²θ dθ","√(x²−a²): x = a secθ, dx = a secθ tanθ dθ","1 − sin²θ = cos²θ","1 + tan²θ = sec²θ"],
      graphs: [{ label: "Trig Sub Reference Triangles", desc: "Three triangles for the three cases" }]
    },
    { id: "7.4", name: "7.4: Partial Fractions",
      concepts: ["Decomposes **rational functions** into simpler fractions","If deg(numerator) ≥ deg(denominator): **long division first**","Factor denominator into linear and irreducible quadratic factors","**Distinct linear**: A/(x−r); **repeated**: A/(x−r) + B/(x−r)² + ...","**Irreducible quadratic**: (Ax+B)/(x²+bx+c)"],
      formulas: ["P(x)/[(x−a)(x−b)] = A/(x−a) + B/(x−b)","P(x)/(x−a)² = A/(x−a) + B/(x−a)²","∫1/(x−a) dx = ln|x−a| + C","∫1/(x²+a²) dx = (1/a)arctan(x/a) + C","∫x/(x²+a²) dx = ½ ln(x²+a²) + C"],
      graphs: []
    },
    { id: "7.5", name: "7.5: Strategy for Integration",
      concepts: ["**Step 1**: Simplify — factor, expand, trig identities","**Step 2**: Recognize standard forms — u-sub visible?","**Step 3**: Classify — rational/trig powers/root?","**Step 4**: IBP — if product of different types","**Step 5**: Manipulate — conjugate, split, complete square"],
      formulas: ["Rational? → partial fractions","Trig powers? → trig integrals","√(a²±x²)? → trig sub","Product of unlike types? → IBP (LIATE)","Composite f(g(x))·g′(x)? → u-sub"],
      graphs: []
    },
    { id: "7.8", name: "7.8: Improper Integrals",
      concepts: ["**Type 1**: infinite limits — use limit as t→∞","**Type 2**: discontinuous integrand — vertical asymptote","**Converges** if limit exists and is finite","**Comparison Test**: 0 ≤ f ≤ g, ∫g converges → ∫f converges","p-integral: ∫[1,∞) 1/xᵖ converges iff p > 1"],
      formulas: ["∫[a,∞) f = lim[t→∞] ∫[a,t] f(x) dx","∫(−∞,∞) f = ∫(−∞,0] f + ∫[0,∞) f","Type 2 (asymptote at b): lim[t→b⁻] ∫[a,t] f","p-integral: 1/(p−1) for p>1; diverges p≤1","∫[0,1] x⁻ᵖ: converges p<1; diverges p≥1"],
      graphs: [{ label: "Convergent vs Divergent", desc: "1/x² converges (p=2>1); 1/x diverges (p=1)" }]
    },
  ],
  test2: [
    { id: "8.1", name: "8.1: Arc Length",
      concepts: ["Derived from **Pythagorean theorem** on infinitesimal segments","ds = √(1+(dy/dx)²) dx for y = f(x)","For x=g(y): ∫√(1+(dx/dy)²) dy","Often no elementary antiderivative — numerical methods","Arc length ≥ straight-line distance between endpoints"],
      formulas: ["L = ∫[a,b] √(1 + [f′(x)]²) dx","L = ∫[c,d] √(1 + [g′(y)]²) dy","Surface area: S = 2π∫f(x)√(1+[f′(x)]²) dx"],
      graphs: [{ label: "Arc Length Approximation", desc: "Secant polygons → arc length as segments→0" }]
    },
    { id: "10.1", name: "10.1: Parametric Equations",
      concepts: ["Curve defined by x=f(t) and y=g(t) for t in interval","Parameter t often represents time","Parametric curves can **self-intersect** or loop","Eliminate t for Cartesian form — not always useful","Direction: curve traced in direction of increasing t"],
      formulas: ["Parametric: (x,y)=(f(t),g(t)), t∈[α,β]","Circle: x=r cos t, y=r sin t","Ellipse: x=a cos t, y=b sin t","Cycloid: x=r(t−sin t), y=r(1−cos t)"],
      graphs: [{ label: "Cycloid", desc: "Trace of a point on a rolling circle" },{ label: "Self-intersecting Curve", desc: "Lissajous figure showing self-crossing" }]
    },
    { id: "10.2", name: "10.2: Calculus with Parametric Curves",
      concepts: ["**Slope**: dy/dx = (dy/dt)/(dx/dt), dx/dt ≠ 0","**Second derivative**: d²y/dx² = [d(dy/dx)/dt]/(dx/dt)","Horizontal tangent: dy/dt=0; vertical: dx/dt=0","Arc length = ∫speed = ∫√((dx/dt)²+(dy/dt)²)","Area: ∫y dx = ∫g(t)f′(t) dt"],
      formulas: ["dy/dx = (dy/dt)/(dx/dt)","d²y/dx² = [d/dt(dy/dx)]/(dx/dt)","L = ∫[α,β] √((dx/dt)²+(dy/dt)²) dt","A = ∫[α,β] g(t) f′(t) dt"],
      graphs: []
    },
    { id: "10.3", name: "10.3: Polar Coordinates",
      concepts: ["Point (r,θ): r=distance from origin, θ=angle from x-axis","x=r cosθ, y=r sinθ; r²=x²+y², tanθ=y/x","**r can be negative**: (−r,θ) = (r,θ+π)","Circles, roses, cardioids, limaçons, lemniscates","Infinitely many representations: (r, θ+2nπ)"],
      formulas: ["x=r cosθ, y=r sinθ","r²=x²+y², tanθ=y/x","Cardioid: r=a(1+cosθ)","Rose: r=a cos(nθ) — n or 2n petals","Lemniscate: r²=a² cos(2θ)"],
      graphs: [{ label: "Polar Curves Gallery", desc: "Cardioid, rose, limaçon, lemniscate" }]
    },
    { id: "10.4", name: "10.4: Calculus in Polar",
      concepts: ["Area: sector dA=½r²dθ, integrated over sweep","Slope: use parametric x=r cosθ, y=r sinθ","Area between curves: ½∫(r_outer²−r_inner²)dθ","Find intersections: r₁(θ)=r₂(θ) AND check pole","Arc length: ∫√(r²+(dr/dθ)²)dθ"],
      formulas: ["A = ½∫[α,β] [r(θ)]² dθ","A between: ½∫(r₂²−r₁²) dθ","L = ∫√(r²+(dr/dθ)²) dθ","dy/dx = (r′sinθ+r cosθ)/(r′cosθ−r sinθ)"],
      graphs: [{ label: "Polar Area Sector", desc: "Sectors of dθ accumulate to total polar area" }]
    },
    { id: "11.1", name: "11.1: Sequences",
      concepts: ["A **sequence** {aₙ} indexed by n=1,2,3,…","**Converges** if lim[n→∞] aₙ = L (finite)","Squeeze theorem and L'Hôpital apply to sequences","rⁿ→0 if |r|<1; (1+1/n)ⁿ→e","**Monotone Convergence**: bounded + monotone → converges"],
      formulas: ["Arithmetic: aₙ=a₁+(n−1)d","Geometric: aₙ=a₁·rⁿ⁻¹","Squeeze: bₙ≤aₙ≤cₙ, bₙ,cₙ→L ⟹ aₙ→L","lim (1+x/n)ⁿ = eˣ"],
      graphs: [{ label: "Convergent vs Divergent Sequences", desc: "{1/n}→0 vs {(−1)ⁿ} oscillating" }]
    },
    { id: "11.2", name: "11.2: Series",
      concepts: ["**Series** Σaₙ converges if partial sums Sₙ converge","**Geometric**: Σarⁿ=a/(1−r) if |r|<1","**Divergence test**: lim aₙ≠0 → diverges","lim aₙ=0 is necessary but NOT sufficient","**Telescoping**: consecutive terms cancel"],
      formulas: ["Geometric: Σarⁿ=a/(1−r), |r|<1","Sₙ=a(1−rⁿ)/(1−r)","Divergence: lim aₙ≠0 ⟹ Σaₙ diverges","Harmonic: Σ(1/n) diverges"],
      graphs: []
    },
    { id: "11.3", name: "11.3: Integral Test",
      concepts: ["If f positive, continuous, decreasing: Σf(n) and ∫f same behavior","**p-series**: Σ1/nᵖ converges iff p>1","Remainder estimate: Rₙ ≤ ∫[n,∞) f(x)dx","Does not give exact sum — only convergence","Must verify: positive, continuous, decreasing"],
      formulas: ["p-series: Σ1/nᵖ converges iff p>1","Remainder: Rₙ≤∫[n,∞) f(x)dx","∫[1,∞) x⁻ᵖ dx = 1/(p−1) for p>1"],
      graphs: []
    },
    { id: "11.4", name: "11.4: Comparison Tests",
      concepts: ["**Direct**: 0≤aₙ≤bₙ; Σbₙ converges → Σaₙ converges","**Limit Comparison**: lim(aₙ/bₙ)=c>0 → same behavior","Choose comparison similar to aₙ for large n","Need a known benchmark (p-series or geometric)","Limit comparison easier when direct fails"],
      formulas: ["Direct: 0≤aₙ≤bₙ: Σbₙ<∞ ⟹ Σaₙ<∞","Limit: lim aₙ/bₙ = c∈(0,∞) → same behavior","Benchmark: Σ1/nᵖ or Σrⁿ"],
      graphs: []
    },
    { id: "11.5", name: "11.5: Alternating Series",
      concepts: ["**AST**: Σ(−1)ⁿbₙ converges if bₙ>0, bₙ→0, bₙ decreasing","**Absolute convergence**: Σ|aₙ| converges → Σaₙ converges","**Conditional**: Σaₙ converges but Σ|aₙ| diverges","Remainder: |Rₙ| ≤ bₙ₊₁","Absolute implies conditional (not vice versa)"],
      formulas: ["AST: bₙ>0, bₙ₊₁≤bₙ, lim bₙ=0 ⟹ converges","Remainder: |S−Sₙ|≤bₙ₊₁","Absolute: Σ|aₙ|<∞ ⟹ Σaₙ converges"],
      graphs: []
    },
    { id: "11.6", name: "11.6: Ratio & Root Tests",
      concepts: ["**Ratio**: L=lim|aₙ₊₁/aₙ|. L<1→conv; L>1→div; L=1→?","**Root**: L=lim|aₙ|^(1/n). Same rule","Ratio works for **factorials, exponentials**","Root works when aₙ is an **nth power**","Both inconclusive for p-series (L=1 always)"],
      formulas: ["Ratio: L=lim|aₙ₊₁/aₙ|","Root: L=lim|aₙ|^(1/n)","L<1: converges; L>1: diverges; L=1: inconclusive","n! grows faster than any exponential"],
      graphs: []
    },
    { id: "11.7", name: "11.7: Strategy for Series",
      concepts: ["**Divergence test first**: lim aₙ≠0 → done","Recognize **geometric** (arⁿ) and **p-series** (1/nᵖ)","**Alternating?** → AST then check absolute","**Factorials/exponentials?** → ratio test","**Rational/algebraic?** → comparison with p-series"],
      formulas: ["Flow: Divergence→Geometric/p→Alternating→Ratio/Root→Comparison","Contains n! → Ratio Test","aₙ=(bₙ)ⁿ → Root Test","aₙ~1/nᵖ → p-series comparison"],
      graphs: []
    },
    { id: "11.8", name: "11.8: Power Series",
      concepts: ["**Power series**: Σcₙ(x−a)ⁿ — series of functions","**Radius R**: converges absolutely for |x−a|<R","Find R via Ratio Test: R=lim|cₙ/cₙ₊₁|","Endpoints must be tested **separately**","**Interval of convergence**: complete set of x-values"],
      formulas: ["Power series: Σcₙ(x−a)ⁿ","R=lim|cₙ/cₙ₊₁|","Converges on (a−R, a+R)","R=0: only at x=a; R=∞: all x"],
      graphs: []
    },
    { id: "11.9", name: "11.9: Functions as Power Series",
      concepts: ["1/(1−x)=Σxⁿ for |x|<1 — the geometric formula","**Differentiate/integrate** term-by-term within R","Substitute into known series (replace x with −x², x², etc.)","Term-by-term preserves radius (check endpoints)","Represent ln(1+x), arctan(x), etc. as power series"],
      formulas: ["1/(1−x)=Σxⁿ, |x|<1","1/(1+x)=Σ(−1)ⁿxⁿ","ln(1+x)=Σ(−1)ⁿ⁺¹xⁿ/n, |x|≤1","arctan(x)=Σ(−1)ⁿx^(2n+1)/(2n+1)","d/dx[Σcₙxⁿ]=Σncₙxⁿ⁻¹ (same R)"],
      graphs: []
    },
    { id: "11.10", name: "11.10: Taylor & Maclaurin Series",
      concepts: ["**Taylor**: Σf⁽ⁿ⁾(a)(x−a)ⁿ/n!","**Maclaurin**: Taylor centered at a=0","**Taylor polynomial** Tₙ(x): partial sum approximation","**Taylor's Inequality**: |Rₙ|≤M|x−a|ⁿ⁺¹/(n+1)!","Memorize: eˣ, sinx, cosx, 1/(1−x), ln(1+x), arctanx"],
      formulas: ["Taylor: f(x)=Σf⁽ⁿ⁾(a)(x−a)ⁿ/n!","eˣ=Σxⁿ/n!, all x","sinx=Σ(−1)ⁿx^(2n+1)/(2n+1)!, all x","cosx=Σ(−1)ⁿx^(2n)/(2n)!, all x","(1+x)ᵏ=Σ C(k,n)xⁿ, |x|<1"],
      graphs: [{ label: "Taylor Polynomial Convergence", desc: "T₁,T₃,T₅,T₇ of sin(x) converging" }]
    },
  ]
};

const ALL_UNITS = [...UNITS.test1, ...UNITS.test2];

const DIFFICULTY_QUESTIONS = {
  easy: [
    { q: "Evaluate ∫3x² dx", a: "x³ + C", unit: "5.4", topic: "Basic Antiderivatives", difficulty: "easy" },
    { q: "Evaluate ∫cos(x) dx", a: "sin(x) + C", unit: "5.4", topic: "Basic Antiderivatives", difficulty: "easy" },
    { q: "Evaluate ∫2x·cos(x²) dx", a: "sin(x²) + C  [let u = x²]", unit: "5.5", topic: "U-Substitution", difficulty: "easy" },
    { q: "Find the area between y = x + 2 and y = x² on [0, 2]", a: "∫₀²(x+2−x²)dx = 10/3", unit: "6.1", topic: "Areas Between Curves", difficulty: "easy" },
    { q: "Does Σ 1/n² converge?", a: "Yes — p-series with p=2>1 converges", unit: "11.3", topic: "p-Series", difficulty: "easy" },
    { q: "Evaluate ∫x·eˣ dx using IBP", a: "u=x, dv=eˣdx → xeˣ − eˣ + C", unit: "7.1", topic: "Integration by Parts", difficulty: "easy" },
    { q: "Does Σ n/(n+1) converge or diverge?", a: "Diverge: lim n/(n+1) = 1 ≠ 0", unit: "11.2", topic: "Divergence Test", difficulty: "easy" },
    { q: "Convert (3, π/4) from polar to Cartesian", a: "x = 3√2/2, y = 3√2/2", unit: "10.3", topic: "Polar Coordinates", difficulty: "easy" },
    { q: "Find the arc length of y = x on [0,1]", a: "L = √2", unit: "8.1", topic: "Arc Length", difficulty: "easy" },
    { q: "Evaluate ∫sin²(x) dx", a: "x/2 − sin(2x)/4 + C", unit: "7.2", topic: "Trig Integrals", difficulty: "easy" },
  ],
  medium: [
    { q: "Evaluate ∫x²/(x²−1) dx using partial fractions", a: "x + ½ln|x−1| − ½ln|x+1| + C", unit: "7.4", topic: "Partial Fractions", difficulty: "medium" },
    { q: "Disk method: y=√x, y=0, x=4 rotated about x-axis", a: "V = π∫₀⁴ x dx = 8π", unit: "6.2", topic: "Disk Method", difficulty: "medium" },
    { q: "Evaluate ∫₀^∞ e⁻ˣ dx", a: "Converges to 1", unit: "7.8", topic: "Improper Integrals", difficulty: "medium" },
    { q: "Find dy/dx for x=t², y=t³−3t at t=2", a: "(3t²−3)/(2t) at t=2: 9/4", unit: "10.2", topic: "Parametric Calculus", difficulty: "medium" },
    { q: "Area enclosed by r = 2cos(θ)", a: "A = π", unit: "10.4", topic: "Polar Area", difficulty: "medium" },
    { q: "Radius of convergence of Σ xⁿ/n!", a: "R = ∞", unit: "11.8", topic: "Power Series", difficulty: "medium" },
    { q: "Ratio Test on Σ n!/(nⁿ)", a: "L = 1/e < 1. Converges.", unit: "11.6", topic: "Ratio Test", difficulty: "medium" },
    { q: "Evaluate ∫√(1−x²) dx using trig sub", a: "½arcsin(x) + ½x√(1−x²) + C", unit: "7.3", topic: "Trig Substitution", difficulty: "medium" },
    { q: "3rd degree Maclaurin polynomial for eˣ", a: "1 + x + x²/2 + x³/6", unit: "11.10", topic: "Taylor Series", difficulty: "medium" },
    { q: "Shell method: x=y−y², x=0 rotated about y-axis", a: "V = π/6", unit: "6.3", topic: "Shell Method", difficulty: "medium" },
  ],
  hard: [
    { q: "Evaluate ∫₀^π/2 sin³(x)cos²(x) dx", a: "2/15", unit: "7.2", topic: "Trig Integrals", difficulty: "hard" },
    { q: "Taylor series for ln(1+x) at 0 — find IOC", a: "Σ(−1)ⁿ⁺¹xⁿ/n; IOC: (−1,1]", unit: "11.10", topic: "Taylor Series", difficulty: "hard" },
    { q: "Limit Comparison Test: Σ (2n²+n)/(5n⁴+1)", a: "Compare to 1/n². L=2/5. Converges.", unit: "11.4", topic: "Comparison Tests", difficulty: "hard" },
    { q: "Volume: y=x², y=0, 0≤x≤1 rotated about x=2 (shells)", a: "V = 5π/6", unit: "6.3", topic: "Shell Method", difficulty: "hard" },
    { q: "Evaluate ∫ x/(x²+2x+5) dx", a: "½ln((x+1)²+4)−½arctan((x+1)/2)+C", unit: "7.4", topic: "Partial Fractions", difficulty: "hard" },
    { q: "Arc length of x=t², y=t³ for t∈[0,1]", a: "(1/27)(13^(3/2)−8)", unit: "10.2", topic: "Parametric Arc Length", difficulty: "hard" },
    { q: "Power series for x/(1+4x²) and IOC", a: "Σ(−1)ⁿ4ⁿx^(2n+1); |x|<1/2", unit: "11.9", topic: "Functions as Power Series", difficulty: "hard" },
    { q: "Does Σ(−1)ⁿ·n/(n²+1) converge absolutely, conditionally, or diverge?", a: "Conditionally convergent", unit: "11.5", topic: "Alternating Series", difficulty: "hard" },
  ]
};

// ============================================================
// WORKED EXAMPLES
// ============================================================
const WORKED_EXAMPLES = {
  "5.4": [
    { title: "Net Change: displacement vs distance", steps: ["Given v(t) = t² − 4t + 3 on [0, 4]", "Roots: t² − 4t + 3 = (t−1)(t−3) = 0 → t = 1, 3", "Displacement = ∫₀⁴ v(t)dt = [t³/3 − 2t² + 3t]₀⁴ = 4/3", "Total distance = ∫₀¹v dt + |∫₁³v dt| + ∫₃⁴v dt = 4/3 + 4/3 + 4/3 = 4"] },
    { title: "Antiderivative with initial condition", steps: ["Find f(x) given f′(x) = 3x² − 2x + 1, f(0) = 5", "∫(3x² − 2x + 1)dx = x³ − x² + x + C", "f(0) = C = 5 → f(x) = x³ − x² + x + 5"] },
  ],
  "5.5": [
    { title: "U-sub — definite integral", steps: ["Evaluate ∫₀² x·eˣ² dx", "Let u = x², du = 2x dx → x dx = du/2", "Limits: x=0→u=0, x=2→u=4", "∫₀⁴ eᵘ·(du/2) = ½[eᵘ]₀⁴ = ½(e⁴ − 1)"] },
    { title: "U-sub — trig: ∫tan(x)dx", steps: ["Write as ∫sin(x)/cos(x)dx", "Let u = cos x, du = −sin x dx", "∫(−du)/u = −ln|u| + C = ln|sec x| + C"] },
  ],
  "6.1": [
    { title: "Area between two curves", steps: ["Find area between y=x+2 and y=x²", "Intersect: x²=x+2 → x=−1, x=2", "On [−1,2]: x+2 ≥ x²", "A = ∫₋₁²(x+2−x²)dx = [x²/2+2x−x³/3]₋₁² = 9/2"] },
  ],
  "6.2": [
    { title: "Washer method", steps: ["Rotate y=x, y=x² on [0,1] about x-axis", "R(x)=x (outer), r(x)=x² (inner)", "V = π∫₀¹(x²−x⁴)dx = π(1/3−1/5) = 2π/15"] },
    { title: "Disk method — y-axis", steps: ["Rotate y=√x, x=0, y=2 about y-axis", "x = y²: V = π∫₀²(y²)²dy = π[y⁵/5]₀² = 32π/5"] },
  ],
  "6.3": [
    { title: "Shell around y-axis", steps: ["Rotate y=x², y=0, x=2 about y-axis", "V = 2π∫₀² x·x² dx = 2π[x⁴/4]₀² = 8π"] },
    { title: "Shell around x=2", steps: ["Rotate y=x², y=0, 0≤x≤1 about x=2", "Radius = 2−x; V = 2π∫₀¹(2−x)x²dx = 5π/6"] },
  ],
  "7.1": [
    { title: "IBP: ∫x·sin(x)dx", steps: ["LIATE: u=x, dv=sinx dx", "du=dx, v=−cosx", "= −x cosx − ∫(−cosx)dx = −x cosx + sinx + C"] },
    { title: "IBP twice: ∫eˣsin(x)dx", steps: ["Let I = ∫eˣsinx dx", "IBP: I = eˣsinx − ∫eˣcosx dx", "IBP again: ∫eˣcosx dx = eˣcosx + I", "I = eˣsinx − eˣcosx − I → 2I = eˣ(sinx−cosx)", "I = (eˣ/2)(sinx − cosx) + C"] },
  ],
  "7.2": [
    { title: "∫sin³x cos²x dx", steps: ["Odd sin power: save one sinx, convert rest", "∫(1−cos²x)·cos²x·sinx dx", "u=cosx, du=−sinx dx", "−∫(1−u²)u² du = −u³/3 + u⁵/5 + C = −cos³x/3 + cos⁵x/5 + C"] },
  ],
  "7.3": [
    { title: "∫√(9−x²)dx — sine sub", steps: ["x=3sinθ, dx=3cosθ dθ, √(9−x²)=3cosθ", "9∫cos²θ dθ = (9/2)(θ+sin2θ/2)+C", "Back-sub: θ=arcsin(x/3)", "= (9/2)arcsin(x/3) + (x/2)√(9−x²) + C"] },
  ],
  "7.4": [
    { title: "Partial fractions: distinct linear", steps: ["∫(2x+1)/[(x−1)(x+3)]dx", "A/(x−1)+B/(x+3): x=1→A=3/4, x=−3→B=5/4", "(3/4)ln|x−1| + (5/4)ln|x+3| + C"] },
  ],
  "7.5": [
    { title: "Strategy decision tree", steps: ["1. Simplify — expand, factor, trig identities", "2. Recognize standard forms; try u-sub", "3. Rational function? → partial fractions", "4. Product of unlike types? → IBP (LIATE)", "5. Has √(a²±x²)? → trig substitution"] },
  ],
  "7.8": [
    { title: "Type 1: ∫₁^∞ 1/x² dx", steps: ["= lim[t→∞] [−1/x]₁ᵗ = lim(−1/t+1) = 1", "Converges (p=2>1)"] },
    { title: "Type 2: ∫₀¹ 1/√x dx", steps: ["= lim[t→0⁺] [2√x]ₜ¹ = 2−0 = 2", "Converges (p=1/2<1)"] },
  ],
  "8.1": [
    { title: "Arc length of y=(2/3)x^(3/2) on [0,4]", steps: ["y′=√x, [y′]²=x", "L = ∫₀⁴√(1+x)dx", "u=1+x: [(2/3)u^(3/2)]₁⁵ = (2/3)(5√5−1)"] },
  ],
  "10.1": [
    { title: "Eliminating the parameter", steps: ["x=t², y=t³ (t≥0)", "t=√x → y=(√x)³=x^(3/2)"] },
  ],
  "10.2": [
    { title: "Slope at t=2: x=t²−1, y=t³−3t", steps: ["dx/dt=2t, dy/dt=3t²−3", "dy/dx=(3t²−3)/(2t)", "At t=2: (12−3)/4 = 9/4"] },
  ],
  "10.3": [
    { title: "Sketch r=1+cosθ (cardioid)", steps: ["θ=0→r=2, θ=π/2→r=1, θ=π→r=0, θ=3π/2→r=1", "Symmetric about polar axis", "Heart-shaped, passes through pole at θ=π"] },
  ],
  "10.4": [
    { title: "Area: r=2sinθ", steps: ["Traced once on [0,π]", "A = ½∫₀^π(2sinθ)²dθ = 2∫₀^π sin²θ dθ = π"] },
  ],
  "11.1": [
    { title: "Limit via L'Hôpital: lim n·e^(−n)", steps: ["Rewrite: n/eⁿ → ∞/∞", "L'Hôpital: lim 1/eⁿ = 0", "Sequence converges to 0"] },
  ],
  "11.2": [
    { title: "Geometric series: Σ(2/3)ⁿ", steps: ["a=2/3, r=2/3, |r|<1", "Sum = (2/3)/(1−2/3) = 2"] },
    { title: "Telescoping: Σ 1/(n(n+1))", steps: ["1/(n(n+1))=1/n−1/(n+1)", "Sₙ=1−1/(n+1)→1 as n→∞"] },
  ],
  "11.3": [
    { title: "Integral test on Σ1/n²", steps: ["f(x)=1/x²: positive, continuous, decreasing", "∫₁^∞1/x²dx=1 converges", "→ Σ1/n² converges (p=2>1)"] },
  ],
  "11.4": [
    { title: "LCT: Σ(2n+1)/(n²+3n)", steps: ["≈2n/n²=2/n for large n; compare to Σ1/n", "L=lim[(2n+1)/(n²+3n)]·n=2", "L∈(0,∞) and Σ1/n diverges → diverges"] },
  ],
  "11.5": [
    { title: "Σ(−1)ⁿ/√n: conditional convergence", steps: ["AST: 1/√n→0, decreasing → converges", "Absolute: Σ1/√n = p=1/2≤1 → diverges", "Conditionally convergent"] },
  ],
  "11.6": [
    { title: "Ratio test: Σ n!/3ⁿ", steps: ["aₙ₊₁/aₙ = (n+1)/3 → ∞", "L=∞>1 → diverges"] },
  ],
  "11.7": [
    { title: "Strategy: Σ n²·e^(−n³)", steps: ["Integral test: ∫x²e^(−x³)dx=−(1/3)e^(−x³)→converges", "Conclusion: series converges"] },
  ],
  "11.8": [
    { title: "IOC of Σ(x−2)ⁿ/(n·3ⁿ)", steps: ["Ratio: L=|x−2|/3, R=3, center x=2", "Test x=5: Σ1/n diverges; x=−1: Σ(−1)ⁿ/n converges (AST)", "IOC: [−1, 5)"] },
  ],
  "11.9": [
    { title: "Power series for ln(1+x)", steps: ["1/(1+x)=Σ(−1)ⁿxⁿ", "Integrate: ln(1+x)=Σ(−1)ⁿxⁿ⁺¹/(n+1), C=0", "IOC: (−1,1]"] },
  ],
  "11.10": [
    { title: "T₄(x) for cos x at 0", steps: ["cos(0)=1, −sin(0)=0, −cos(0)=−1, sin(0)=0, cos(0)=1", "T₄(x)=1−x²/2+x⁴/24"] },
    { title: "Maclaurin for e^(−x²)", steps: ["eˣ=Σxⁿ/n!, replace x with −x²", "e^(−x²)=Σ(−1)ⁿx^(2n)/n! for all x"] },
  ],
};

// ============================================================
// LANDING PAGE
// ============================================================
function LandingPage({ onShowLogin }) {
  const features = [
    { icon: "📚", title: "25 Units of Notes", desc: "Concepts, formulas, and SVG graphs for every Calc 2 topic — from integration to Taylor series." },
    { icon: "🎯", title: "Custom Quizzes", desc: "Build quizzes by unit, difficulty (easy/medium/hard), and time limit. Self-graded with instant answer reveal." },
    { icon: "💬", title: "AI Tutor", desc: "Ask the built-in Calc 2 AI tutor anything — step-by-step solutions, concept explanations, and more." },
    { icon: "📊", title: "Progress Tracking", desc: "Track which units you've visited and your quiz performance by topic across every session." },
    { icon: "🗂", title: "Quiz History", desc: "Every quiz is saved with your answers vs correct answers so you can review what you missed." },
    { icon: "☁️", title: "Cloud Sync", desc: "Sign in with Google or email and your progress syncs across all your devices automatically." },
  ];
  return (
    <div className="landing-wrap">
      <style>{LANDING_STYLES}</style>
      <div className="landing-bg" />
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="landing-logo-icon">∫</div>
          <span className="landing-logo-text">Calc2Pro</span>
        </div>
        <button className="landing-login-btn" onClick={onShowLogin}>Log In / Sign Up →</button>
      </nav>
      <section className="landing-hero">
        <div className="landing-badge">🎓 Calculus II Study Platform</div>
        <h1 className="landing-h1">Ace Calc 2.<br/>Study smarter.</h1>
        <p className="landing-sub">Everything you need for Calc 2 in one place — notes, quizzes, an AI tutor, and progress tracking. Built for students who want results.</p>
        <div className="landing-cta-row">
          <button className="landing-cta-primary" onClick={onShowLogin}>Get Started Free →</button>
          <button className="landing-cta-secondary" onClick={onShowLogin}>Try as Guest</button>
        </div>
        <div className="landing-topics">
          {["Indefinite Integrals","U-Substitution","Volumes (Disk/Washer/Shell)","Integration by Parts","Trig Substitution","Partial Fractions","Improper Integrals","Parametric Curves","Polar Coordinates","Sequences & Series","Power Series","Taylor & Maclaurin"].map(t => (
            <span key={t} className="landing-topic-chip">{t}</span>
          ))}
        </div>
      </section>
      <section className="landing-features">
        <h2 className="landing-section-title">Everything you need</h2>
        <div className="landing-features-grid">
          {features.map((f,i) => (
            <div key={i} className="landing-feature-card">
              <div className="landing-feature-icon">{f.icon}</div>
              <div className="landing-feature-title">{f.title}</div>
              <div className="landing-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="landing-bottom-cta">
        <h2>Ready to start studying?</h2>
        <p>Free to use. No credit card required.</p>
        <button className="landing-cta-primary" onClick={onShowLogin}>Start Now →</button>
      </section>
      <footer className="landing-footer">
        <span>© 2026 Calc2Pro · Built for Calc 2 students</span>
      </footer>
    </div>
  );
}

// ============================================================
// AUTH SCREEN
// ============================================================
function AuthScreen({ onAuth, onBack }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      const { auth } = getFirebase();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onAuth(result.user);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleEmail = async () => {
    setLoading(true); setError("");
    try {
      const { auth } = getFirebase();
      if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(result.user, { displayName: name });
        onAuth(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onAuth(result.user);
      }
    } catch (e) { setError(e.message.replace("Firebase: ", "")); }
    setLoading(false);
  };

  const handleGuest = async () => {
    // Try anonymous auth first; fall back to demo mode if not enabled
    setLoading(true); setError("");
    try {
      const { auth } = getFirebase();
      const result = await signInAnonymously(auth);
      onAuth(result.user);
    } catch (e) {
      // Anonymous auth not enabled — use demo mode silently
      onAuth({ uid: "demo-" + Date.now(), displayName: "Guest", email: null, isAnonymous: true, isDemo: true });
    }
    setLoading(false);
  };

  // Demo mode (no Firebase)
  const handleDemo = () => {
    onAuth({ uid: "demo", displayName: "Demo User", email: null, isAnonymous: true, isDemo: true });
  };

  return (
    <div className="auth-wrap">
      <style>{AUTH_STYLES}</style>
      <div className="auth-bg" />
      <div className="auth-card">
        {onBack && <button className="auth-back-btn" onClick={onBack}>← Back</button>}
        <div className="auth-logo">∫</div>
        <h1 className="auth-title">Calc2Pro</h1>
        <p className="auth-sub">Your Calculus II study companion</p>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l6-6C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.5-4z"/></svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "auth-tab active" : "auth-tab"} onClick={() => setMode("login")}>Log In</button>
          <button className={mode === "signup" ? "auth-tab active" : "auth-tab"} onClick={() => setMode("signup")}>Sign Up</button>
        </div>

        {mode === "signup" && (
          <input className="auth-input" placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)} />
        )}
        <input className="auth-input" type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleEmail()} />
        <input className="auth-input" type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleEmail()} />

        <button className="btn-primary-auth" onClick={handleEmail} disabled={loading || !email || !password}>
          {loading ? "..." : mode === "login" ? "Log In" : "Create Account"}
        </button>

        <div className="auth-divider"><span>or</span></div>

        <button className="btn-guest" onClick={handleGuest} disabled={loading}>
          Continue as Guest
          <span className="guest-note"> (progress not saved)</span>
        </button>

        <button className="btn-demo" onClick={handleDemo}>
          🔍 Try Demo (no Firebase needed)
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FIRESTORE SYNC HELPERS
// ============================================================
async function loadUserData(uid) {
  try {
    const { db } = getFirebase();
    if (!db) return null;
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

async function saveUserData(uid, data) {
  try {
    const { db } = getFirebase();
    if (!db) return;
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch { /* silently fail */ }
}

async function appendQuizLog(uid, log) {
  try {
    const { db } = getFirebase();
    if (!db) return;
    await updateDoc(doc(db, "users", uid), {
      quizLogs: arrayUnion(log)
    });
  } catch {
    await saveUserData(uid, { quizLogs: [log] });
  }
}

// ============================================================
// MAIN APP
// ============================================================
export default function Calc2Pro() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [activeUnit, setActiveUnit] = useState("5.4");
  const [activeTest, setActiveTest] = useState("test1");
  const [unitQuizState, setUnitQuizState] = useState(null);
  const [customQuizState, setCustomQuizState] = useState(null);
  const [customQuizConfig, setCustomQuizConfig] = useState({
    selectedUnits: ALL_UNITS.map(u => u.id), numQuestions: 5, timeLimit: 0, difficulties: ["easy", "medium"], examMode: false,
  });
  const [chatCount, setChatCount] = useState(0);
  const CHAT_LIMIT = 10;
  const [showCalcKeyboard, setShowCalcKeyboard] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Calc 2 tutor. Ask me anything about concepts, formulas, or quiz questions!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [tracker, setTracker] = useState({});
  const [quizLogs, setQuizLogs] = useState([]);
  const [visitedUnits, setVisitedUnits] = useState({});
  const [timerLeft, setTimerLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | saving | saved
  const [showLogs, setShowLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [showLanding, setShowLanding] = useState(true);
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const syncTimer = useRef(null);

  // Check Firebase auth state on mount
  useEffect(() => {
    const { auth } = getFirebase();
    if (!auth) { setAuthChecked(true); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const data = await loadUserData(u.uid);
        if (data) {
          if (data.tracker) setTracker(data.tracker);
          if (data.quizLogs) setQuizLogs(data.quizLogs);
          if (data.visitedUnits) setVisitedUnits(data.visitedUnits);
          if (data.chatMessages) setChatMessages(data.chatMessages);
          if (data.customQuizConfig) setCustomQuizConfig(data.customQuizConfig);
        }
      }
      setAuthChecked(true);
    });
    return () => unsub && unsub();
  }, []);

  // Debounced sync to Firestore
  const syncToCloud = useCallback((updates) => {
    if (!user || user.isDemo || user.isAnonymous) return;
    setSyncStatus("saving");
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      await saveUserData(user.uid, updates);
      setSyncStatus("saved");
      setTimeout(() => setSyncStatus("idle"), 2000);
    }, 1500);
  }, [user]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (timerActive && timerLeft > 0) {
      timerRef.current = setTimeout(() => setTimerLeft(t => t - 1), 1000);
    } else if (timerActive && timerLeft === 0) {
      setTimerActive(false);
      if (customQuizState?.phase === "quiz") setCustomQuizState(s => ({ ...s, phase: "results" }));
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timerLeft]);

  // Track visited units
  const markUnitVisited = useCallback((unitId) => {
    setVisitedUnits(prev => {
      const updated = { ...prev, [unitId]: (prev[unitId] || 0) + 1 };
      syncToCloud({ visitedUnits: updated });
      return updated;
    });
  }, [syncToCloud]);

  const recordAnswer = useCallback((unitId, topic, correct) => {
    setTracker(prev => {
      const key = `${unitId}::${topic}`;
      const existing = prev[key] || { correct: 0, total: 0, topic, unit: unitId };
      const updated = { ...prev, [key]: { ...existing, correct: existing.correct + (correct ? 1 : 0), total: existing.total + 1 } };
      syncToCloud({ tracker: updated });
      return updated;
    });
  }, [syncToCloud]);

  const saveQuizLog = useCallback((log) => {
    setQuizLogs(prev => {
      const updated = [log, ...prev].slice(0, 50); // keep last 50
      syncToCloud({ quizLogs: updated });
      return updated;
    });
    if (user && !user.isDemo && !user.isAnonymous) {
      appendQuizLog(user.uid, log);
    }
  }, [user, syncToCloud]);

  // ---- WEAK TOPICS ----
  const weakTopicUnits = () => {
    const weak = Object.values(tracker).filter(t => (t.correct / t.total) < 0.7);
    return [...new Set(weak.map(t => t.unit))];
  };

  // ---- UNIT QUIZ ----
  const startUnitQuiz = (unitId) => {
    const pool = [...DIFFICULTY_QUESTIONS.easy, ...DIFFICULTY_QUESTIONS.medium, ...DIFFICULTY_QUESTIONS.hard]
      .filter(q => q.unit === unitId).sort(() => Math.random() - 0.5).slice(0, 5);
    if (!pool.length) { alert("No questions for this unit yet."); return; }
    setUnitQuizState({ questions: pool, current: 0, answers: Array(pool.length).fill(""), showAnswer: false, phase: "quiz", score: 0, startTime: Date.now(), type: "unit", unitId });
    setActiveTab("unitquiz");
  };

  // ---- CUSTOM QUIZ ----
  const startCustomQuiz = (weakMode = false) => {
    const { selectedUnits, numQuestions, timeLimit, difficulties, examMode } = customQuizConfig;
    const targetUnits = weakMode ? weakTopicUnits() : selectedUnits;
    const pool = difficulties.flatMap(d => DIFFICULTY_QUESTIONS[d] || [])
      .filter(q => targetUnits.includes(q.unit)).sort(() => Math.random() - 0.5).slice(0, numQuestions);
    if (!pool.length) { alert(weakMode ? "No weak topics found — take more quizzes first!" : "No questions match your filters."); return; }
    setCustomQuizState({ questions: pool, current: 0, answers: Array(pool.length).fill(""), showAnswer: false, phase: "quiz", score: 0, startTime: Date.now(), type: weakMode ? "weak" : "custom" });
    const tl = (examMode && !weakMode) ? numQuestions * 90 : timeLimit > 0 ? timeLimit * 60 : 0;
    if (tl > 0) { setTimerLeft(tl); setTimerActive(true); }
    else { setTimerLeft(null); setTimerActive(false); }
    setActiveTab("customquiz");
    syncToCloud({ customQuizConfig });
  };

  // ---- CHAT ----
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    if (chatCount >= CHAT_LIMIT) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    const newCount = chatCount + 1;
    setChatCount(newCount);
    const context = `You are an expert Calculus 2 tutor for Calc2Pro. Topics: indefinite integrals, net change, substitution, areas, volumes (disk/washer/shell), IBP, trig integrals, trig sub, partial fractions, improper integrals, arc length, parametric curves, polar coordinates, sequences, series, convergence tests, power series, Taylor/Maclaurin series. Be concise, use ∫ Σ lim π notation. Show step-by-step work.`;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6-20250514", max_tokens: 1000, system: context,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || data.error?.message || "Sorry, no response.";
      const finalMessages = [...newMessages, { role: "assistant", content: reply }];
      setChatMessages(finalMessages);
      syncToCloud({ chatMessages: finalMessages.slice(-30) }); // keep last 30
    } catch {
      setChatMessages(m => [...m, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setChatLoading(false);
  };

  const handleSignOut = async () => {
    const { auth } = getFirebase();
    if (auth) await signOut(auth);
    setUser(null); setTracker({}); setQuizLogs([]); setVisitedUnits({});
    setChatMessages([{ role: "assistant", content: "Hi! I'm your Calc 2 tutor. Ask me anything!" }]);
  };


  if (!authChecked) return <div style={{ background: "#080f1e", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", fontFamily: "sans-serif", fontSize: "1.2rem" }}>Loading...</div>;
  if (!user) {
    if (showLanding) return <LandingPage onShowLogin={() => setShowLanding(false)} />;
    return <AuthScreen onAuth={setUser} onBack={() => setShowLanding(true)} />;
  }

  const currentUnit = ALL_UNITS.find(u => u.id === activeUnit) || ALL_UNITS[0];
  const displayName = user.displayName || user.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Home tab stats
  const totalQuizzes = quizLogs.length;
  const avgScore = totalQuizzes > 0 ? Math.round(quizLogs.reduce((s,l) => s+l.pct, 0) / totalQuizzes) : null;
  const weakTopics = Object.values(tracker).filter(t => (t.correct/t.total) < 0.5).sort((a,b) => (a.correct/a.total)-(b.correct/b.total)).slice(0,3);
  const strongTopics = Object.values(tracker).filter(t => (t.correct/t.total) >= 0.8).slice(0,3);
  const recentLog = quizLogs[0];

  const NAV_ITEMS = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "notes", icon: "📚", label: "Notes" },
    { id: "customquiz", icon: "🎯", label: "Custom Quiz" },
    { id: "cheatsheet", icon: "📄", label: "Cheat Sheet" },
    { id: "tracker", icon: "📊", label: "Progress" },
    { id: "history", icon: "🗂", label: "History" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];
  const isDark = theme === "dark";
  const themeVars = isDark ? {
    "--bg": "#080f1e", "--bg2": "#0d1a2e", "--bg3": "#0a1628",
    "--border": "#1e3a5f", "--text": "#e2e8f0", "--text2": "#94a3b8",
    "--text3": "#64748b", "--accent": "#60a5fa"
  } : {
    "--bg": "#f0f4ff", "--bg2": "#ffffff", "--bg3": "#e8edf8",
    "--border": "#c7d4f0", "--text": "#1e293b", "--text2": "#475569",
    "--text3": "#94a3b8", "--accent": "#1d4ed8"
  };

  // ---- QUIZ RENDER ----
  const renderQuizQuestion = (state, setState, isUnit) => {
    if (!state) return null;
    const { questions, current, answers, showAnswer, phase, score } = state;
    const q = questions[current];

    if (phase === "results") {
      const pct = Math.round((score / questions.length) * 100);
      const log = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: isUnit ? `Unit ${state.unitId}` : "Custom",
        score, total: questions.length, pct,
        timeTaken: Math.round((Date.now() - state.startTime) / 1000),
        questions: questions.map((qq, i) => ({
          question: qq.q, correctAnswer: qq.a,
          userAnswer: answers[i] || "(blank)",
          unit: qq.unit, topic: qq.topic, difficulty: qq.difficulty
        }))
      };
      // Save log once
      if (!state.logSaved) {
        saveQuizLog(log);
        setState(s => ({ ...s, logSaved: true }));
      }
      return (
        <div className="quiz-results">
          <div className="results-score" style={{ color: pct >= 70 ? "#4ade80" : "#f87171" }}>{pct}%</div>
          <div style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#cbd5e1" }}>{score}/{questions.length} correct</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1.5rem" }}>
            ⏱ {Math.floor(log.timeTaken/60)}m {log.timeTaken%60}s · Saved to History
          </div>
          <div className="results-breakdown">
            {questions.map((qq, i) => (
              <div key={i} className="result-row">
                <div className="result-q"><strong>Q{i+1} [{qq.difficulty}]:</strong> {qq.q}</div>
                <div className="result-answer-row">
                  <div className="result-your-answer">
                    <span className="answer-label-sm">Your answer:</span>
                    <span style={{ color: "#e2e8f0" }}>{answers[i] || "(no answer)"}</span>
                  </div>
                  <div className="result-correct-answer">
                    <span className="answer-label-sm" style={{ color: "#4ade80" }}>Correct:</span>
                    <span style={{ color: "#86efac" }}>{qq.a}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => { isUnit ? setUnitQuizState(null) : setCustomQuizState(null); setActiveTab(isUnit ? "notes" : "customquiz"); setTimerActive(false); }}>Done</button>
        </div>
      );
    }

    return (
      <div className="quiz-active">
        <div className="quiz-header">
          <span className="quiz-progress">{current + 1} / {questions.length}</span>
          <span className="quiz-topic-tag">{q.topic} · {q.unit}</span>
          <span className={`quiz-diff diff-${q.difficulty}`}>{q.difficulty}</span>
          {timerLeft !== null && !isUnit && (
            <span style={{ color: timerLeft < 30 ? "#f87171" : "#4ade80", fontWeight: 700, fontFamily: "monospace" }}>
              ⏱ {Math.floor(timerLeft/60)}:{String(timerLeft%60).padStart(2,"0")}
            </span>
          )}
        </div>
        <div className="quiz-question">{q.q}</div>
        <textarea className="quiz-input" rows={3}
          placeholder="Type your answer... (open keyboard below for symbols)"
          value={answers[current]}
          onChange={e => setState(s => { const a=[...s.answers]; a[current]=e.target.value; return {...s, answers:a}; })} />
        <div className="quiz-actions">
          {!showAnswer && <button className="btn-secondary" onClick={() => setState(s => ({...s, showAnswer: true}))}>Show Answer</button>}
          {showAnswer && showAnswer !== true && (
            <button className="btn-primary" onClick={() => {
              if (current + 1 >= questions.length) {
                setState(s => ({ ...s, phase: "results" }));
                setTimerActive(false);
              } else {
                setState(s => ({ ...s, current: s.current + 1, showAnswer: false }));
              }
            }}>{current + 1 >= questions.length ? "See Results" : "Next →"}</button>
          )}
          {!showAnswer && <span style={{color:"#475569",fontSize:"0.8rem"}}>Show answer first, then grade yourself</span>}
        </div>
        {showAnswer && (
          <div className="answer-reveal">
            <div className="answer-label">✓ Answer</div>
            <div className="answer-text">{q.a}</div>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Did you get it?</span>
              <button className="btn-correct" onClick={() => { recordAnswer(q.unit, q.topic, true); setState(s => ({ ...s, score: s.score + 1, showAnswer: "shown_correct" })); }}>✓ Yes</button>
              <button className="btn-wrong" onClick={() => { recordAnswer(q.unit, q.topic, false); setState(s => ({ ...s, showAnswer: "shown_wrong" })); }}>✗ No</button>
            </div>
          </div>
        )}
        <button className="btn-ghost" onClick={() => setShowCalcKeyboard(s => !s)} style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          {showCalcKeyboard ? "Hide" : "∫ Show"} Calculator Keyboard
        </button>
        {showCalcKeyboard && <CalcKeyboard onInsert={sym => setState(s => { const a=[...s.answers]; a[s.current]=(a[s.current]||"")+sym; return {...s,answers:a}; })} />}
      </div>
    );
  };

  return (
    <div className={`app theme-${theme} font-${fontSize}`} style={Object.fromEntries(Object.entries(themeVars))}>
      <style>{STYLES}</style>

      {/* TOP HEADER */}
      <header className="app-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(s => !s)}>
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <div className="logo">∫</div>
          <div className="app-title-wrap">
            <div className="app-title">Calc2Pro</div>
            <div className="app-subtitle">Study Center</div>
          </div>
        </div>
        <div className="header-right">
          {syncStatus === "saving" && <span className="sync-badge">↑ Saving…</span>}
          {syncStatus === "saved" && <span className="sync-badge saved">✓ Synced</span>}
          {user.isAnonymous && <span className="guest-badge">Guest</span>}
          <div className="user-avatar" title={displayName}>{initials}</div>
          <button className="btn-ghost" onClick={handleSignOut} style={{fontSize:"0.8rem"}}>Sign out</button>
        </div>
      </header>

      <div className="app-body">

        {/* COLLAPSIBLE SIDEBAR NAV */}
        <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <nav className="side-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id}
                className={`side-nav-btn ${activeTab === item.id || (item.id === "notes" && activeTab === "unitquiz") ? "side-nav-active" : ""}`}
                onClick={() => { setActiveTab(item.id); if (item.id !== "unitquiz") setUnitQuizState(null); }}>
                <span className="side-nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="side-nav-label">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Unit list shown only on Notes */}
          {sidebarOpen && (activeTab === "notes" || activeTab === "unitquiz") && (
            <div className="unit-panel">
              <div className="test-toggle">
                <button className={activeTest==="test1"?"test-btn active":"test-btn"} onClick={()=>{setActiveTest("test1");setActiveUnit("5.4");}}>Test 1</button>
                <button className={activeTest==="test2"?"test-btn active":"test-btn"} onClick={()=>{setActiveTest("test2");setActiveUnit("8.1");}}>Test 2</button>
              </div>
              <div className="unit-list">
                {(activeTest==="test1"?UNITS.test1:UNITS.test2).map(unit => (
                  <button key={unit.id} className={`unit-btn ${activeUnit===unit.id?"unit-active":""}`}
                    onClick={() => { setActiveUnit(unit.id); setActiveTab("notes"); setUnitQuizState(null); markUnitVisited(unit.id); }}>
                    <span className="unit-id">{unit.id}</span>
                    <span className="unit-name">{unit.name.replace(`${unit.id}: `,"")}</span>
                    {visitedUnits[unit.id] && <span className="unit-visited">●</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">

          {/* ===== HOME TAB ===== */}
          {activeTab === "home" && (
            <div className="home-view">
              <div className="home-welcome">
                <div className="home-greeting">👋 Welcome back, {displayName.split(" ")[0]}!</div>
                <div className="home-sub">Here's your Calc 2 study overview</div>
              </div>

              <div className="home-stats-row">
                <div className="stat-card">
                  <div className="stat-number">{Object.keys(visitedUnits).length}<span className="stat-denom">/{ALL_UNITS.length}</span></div>
                  <div className="stat-label">Units Studied</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{totalQuizzes}</div>
                  <div className="stat-label">Quizzes Taken</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{color: avgScore >= 70 ? "#4ade80" : avgScore >= 50 ? "#facc15" : avgScore ? "#f87171" : "#64748b"}}>
                    {avgScore !== null ? `${avgScore}%` : "—"}
                  </div>
                  <div className="stat-label">Avg Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{Object.keys(tracker).length}</div>
                  <div className="stat-label">Topics Practiced</div>
                </div>
              </div>

              <div className="home-grid">
                {/* Suggestions */}
                <div className="home-card">
                  <h3 className="home-card-title">💡 Suggestions</h3>
                  {Object.keys(tracker).length === 0 && Object.keys(visitedUnits).length === 0 ? (
                    <div className="suggestion-item">
                      <div className="sug-icon">🚀</div>
                      <div>
                        <div className="sug-title">Start with Unit 5.4</div>
                        <div className="sug-desc">Begin with Indefinite Integrals — the foundation of Calc 2</div>
                        <button className="sug-btn" onClick={() => { setActiveUnit("5.4"); setActiveTab("notes"); }}>Go →</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {weakTopics.length > 0 && weakTopics.map((t,i) => (
                        <div key={i} className="suggestion-item">
                          <div className="sug-icon" style={{color:"#f87171"}}>⚠️</div>
                          <div>
                            <div className="sug-title">Review: {t.topic}</div>
                            <div className="sug-desc">§{t.unit} — only {Math.round((t.correct/t.total)*100)}% correct ({t.correct}/{t.total})</div>
                            <button className="sug-btn" onClick={() => { setActiveUnit(t.unit); setActiveTest(UNITS.test1.some(x=>x.id===t.unit)?"test1":"test2"); setActiveTab("notes"); }}>Study →</button>
                          </div>
                        </div>
                      ))}
                      {ALL_UNITS.filter(u => !visitedUnits[u.id]).slice(0,2).map((u,i) => (
                        <div key={i} className="suggestion-item">
                          <div className="sug-icon">📖</div>
                          <div>
                            <div className="sug-title">Explore: {u.name}</div>
                            <div className="sug-desc">You haven't visited this unit yet</div>
                            <button className="sug-btn" onClick={() => { setActiveUnit(u.id); setActiveTest(UNITS.test1.some(x=>x.id===u.id)?"test1":"test2"); setActiveTab("notes"); }}>Open →</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Strengths */}
                <div className="home-card">
                  <h3 className="home-card-title">⚡ Your Strengths</h3>
                  {strongTopics.length === 0 ? (
                    <div className="home-empty-msg">Complete more quizzes to discover your strengths!</div>
                  ) : strongTopics.map((t,i) => {
                    const pct = Math.round((t.correct/t.total)*100);
                    return (
                      <div key={i} className="strength-item">
                        <div className="strength-top">
                          <span className="strength-topic">{t.topic}</span>
                          <span className="strength-pct" style={{color:"#4ade80"}}>{pct}%</span>
                        </div>
                        <div className="tracker-bar-wrap"><div className="tracker-bar" style={{width:`${pct}%`,background:"#4ade80"}}/></div>
                      </div>
                    );
                  })}
                  {weakTopics.length > 0 && (
                    <>
                      <h3 className="home-card-title" style={{marginTop:"1.25rem"}}>🔴 Needs Work</h3>
                      {weakTopics.map((t,i) => {
                        const pct = Math.round((t.correct/t.total)*100);
                        return (
                          <div key={i} className="strength-item">
                            <div className="strength-top">
                              <span className="strength-topic">{t.topic}</span>
                              <span className="strength-pct" style={{color:"#f87171"}}>{pct}%</span>
                            </div>
                            <div className="tracker-bar-wrap"><div className="tracker-bar" style={{width:`${pct}%`,background:"#f87171"}}/></div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Recent Quiz */}
                <div className="home-card">
                  <h3 className="home-card-title">🕐 Recent Activity</h3>
                  {!recentLog ? (
                    <div className="home-empty-msg">No quizzes yet — take one to track your progress!</div>
                  ) : (
                    <div>
                      <div className="recent-quiz-score" style={{color: recentLog.pct>=70?"#4ade80":recentLog.pct>=50?"#facc15":"#f87171"}}>
                        {recentLog.pct}%
                      </div>
                      <div style={{color:"#94a3b8",fontSize:"0.85rem",marginBottom:"0.75rem"}}>
                        {recentLog.type} Quiz · {recentLog.score}/{recentLog.total} · {new Date(recentLog.date).toLocaleDateString()}
                      </div>
                      <button className="sug-btn" onClick={() => setActiveTab("history")}>See all history →</button>
                    </div>
                  )}
                  <div style={{marginTop:"1.25rem"}}>
                    <h3 className="home-card-title">📍 Units Coverage</h3>
                    <div className="coverage-bar-wrap">
                      <div className="coverage-bar" style={{width:`${Math.round((Object.keys(visitedUnits).length/ALL_UNITS.length)*100)}%`}} />
                    </div>
                    <div style={{fontSize:"0.8rem",color:"#64748b",marginTop:"0.4rem"}}>
                      {Object.keys(visitedUnits).length} of {ALL_UNITS.length} units visited ({Math.round((Object.keys(visitedUnits).length/ALL_UNITS.length)*100)}%)
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="home-card">
                  <h3 className="home-card-title">⚡ Quick Actions</h3>
                  <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => { setActiveUnit("5.4"); setActiveTab("notes"); }}>📚 Browse Notes</button>
                    <button className="quick-action-btn" onClick={() => setActiveTab("customquiz")}>🎯 Custom Quiz</button>
                    <button className="quick-action-btn" onClick={() => { startUnitQuiz(activeUnit); }}>⚡ Quick Quiz</button>
                    <button className="quick-action-btn" onClick={() => setActiveTab("tracker")}>📊 Progress</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== NOTES TAB ===== */}
          {activeTab === "notes" && !unitQuizState && (
            <div className="notes-view">
              <div className="notes-header">
                <h1 className="notes-title">{currentUnit.name}</h1>
                <button className="btn-quiz-unit" onClick={() => startUnitQuiz(currentUnit.id)}>Quick Quiz →</button>
              </div>
              <div className="notes-grid">
                <section className="notes-card">
                  <h2 className="card-title">💡 Key Concepts</h2>
                  <ul className="concept-list">
                    {currentUnit.concepts.map((c,i) => (
                      <li key={i} className="concept-item" dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>") }} />
                    ))}
                  </ul>
                </section>
                <section className="notes-card">
                  <h2 className="card-title">📐 Key Formulas</h2>
                  <div className="formula-list">
                    {currentUnit.formulas.map((f,i) => <div key={i} className="formula-item">{f}</div>)}
                  </div>
                </section>
                {currentUnit.graphs.length > 0 && (
                  <section className="notes-card full-width">
                    <h2 className="card-title">📈 Key Graphs</h2>
                    <div className="graph-grid">
                      {currentUnit.graphs.map((g,i) => (
                        <div key={i} className="graph-card">
                          <GraphViz unit={currentUnit.id} graphIndex={i} />
                          <div className="graph-label">{g.label}</div>
                          <div className="graph-desc">{g.desc}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {WORKED_EXAMPLES[currentUnit.id] && (
                  <section className="notes-card full-width">
                    <h2 className="card-title">✏️ Worked Examples</h2>
                    <div className="examples-grid">
                      {WORKED_EXAMPLES[currentUnit.id].map((ex, i) => (
                        <div key={i} className="example-card">
                          <div className="example-title">{ex.title}</div>
                          <ol className="example-steps">
                            {ex.steps.map((s, j) => <li key={j} className="example-step">{s}</li>)}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}

          {/* UNIT QUIZ */}
          {activeTab === "unitquiz" && (
            <div className="page-view">
              <h2 style={{marginBottom:"1.5rem"}}>Quick Quiz: {currentUnit.name}</h2>
              {unitQuizState ? renderQuizQuestion(unitQuizState, setUnitQuizState, true) : <p style={{color:"#94a3b8"}}>Loading…</p>}
            </div>
          )}

          {/* ===== CUSTOM QUIZ ===== */}
          {activeTab === "customquiz" && !customQuizState && (
            <div className="page-view">
              <h2 style={{marginBottom:"1.5rem"}}>🎯 Custom Quiz Builder</h2>
              <div className="config-section">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem",flexWrap:"wrap",gap:"0.5rem"}}>
                  <h3 style={{margin:0}}>Select Units</h3>
                  <div style={{display:"flex",gap:"0.4rem"}}>
                    <button className="btn-ghost" style={{fontSize:"0.8rem",border:"1px solid #1e3a5f",borderRadius:6,padding:"0.2rem 0.6rem"}}
                      onClick={() => setCustomQuizConfig(c=>({...c,selectedUnits:ALL_UNITS.map(u=>u.id)}))}>Select All</button>
                    <button className="btn-ghost" style={{fontSize:"0.8rem",border:"1px solid #1e3a5f",borderRadius:6,padding:"0.2rem 0.6rem"}}
                      onClick={() => setCustomQuizConfig(c=>({...c,selectedUnits:[]}))}>Deselect All</button>
                  </div>
                </div>
                <div className="unit-check-grid">
                  {["test1","test2"].map(test => (
                    <div key={test} className="unit-check-group">
                      <div className="unit-check-header">{test==="test1"?"Test 1":"Test 2"}</div>
                      {UNITS[test].map(u => (
                        <label key={u.id} className="unit-check">
                          <input type="checkbox" checked={customQuizConfig.selectedUnits.includes(u.id)}
                            onChange={e => setCustomQuizConfig(c => ({ ...c, selectedUnits: e.target.checked ? [...c.selectedUnits,u.id] : c.selectedUnits.filter(x=>x!==u.id) }))} />
                          <span>{u.name}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="config-row">
                <div className="config-section">
                  <h3>Questions</h3>
                  <div className="num-btns">
                    {[3,5,10,15,20].map(n => (
                      <button key={n} className={customQuizConfig.numQuestions===n?"num-btn active":"num-btn"} onClick={() => setCustomQuizConfig(c=>({...c,numQuestions:n}))}>{n}</button>
                    ))}
                  </div>
                </div>
                <div className="config-section">
                  <h3>Difficulty</h3>
                  <div className="diff-toggles">
                    {["easy","medium","hard"].map(d => (
                      <button key={d} className={`diff-toggle diff-${d} ${customQuizConfig.difficulties.includes(d)?"active":""}`}
                        onClick={() => setCustomQuizConfig(c => ({ ...c, difficulties: c.difficulties.includes(d) ? c.difficulties.filter(x=>x!==d) : [...c.difficulties,d] }))}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="config-section">
                  <h3>Time Limit</h3>
                  <div className="time-input-wrap">
                    <input type="number" min={0} max={120} value={customQuizConfig.timeLimit}
                      onChange={e => setCustomQuizConfig(c=>({...c,timeLimit:Number(e.target.value)}))} className="time-input" />
                    <span style={{color:"#94a3b8"}}>min (0=none)</span>
                  </div>
                </div>
                <div className="config-section">
                  <h3>Exam Mode</h3>
                  <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                    <div className={`exam-toggle ${customQuizConfig.examMode?"exam-on":""}`}
                      onClick={() => setCustomQuizConfig(c=>({...c,examMode:!c.examMode}))}
                      style={{width:44,height:24,borderRadius:12,background:customQuizConfig.examMode?"#dc2626":"#1e3a5f",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                      <div style={{width:18,height:18,borderRadius:9,background:"white",position:"absolute",top:3,left:customQuizConfig.examMode?23:3,transition:"left 0.2s"}}/>
                    </div>
                    <span style={{fontSize:"0.82rem",color:customQuizConfig.examMode?"#f87171":"#64748b"}}>
                      {customQuizConfig.examMode?"🔴 90s per question":"Off"}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",alignItems:"center"}}>
                <button className="btn-start-quiz" onClick={() => startCustomQuiz(false)}>Start Quiz ({customQuizConfig.numQuestions} questions)</button>
                {weakTopicUnits().length > 0 && (
                  <button className="btn-secondary" style={{padding:"0.65rem 1.2rem",fontSize:"0.9rem",fontWeight:600}}
                    onClick={() => startCustomQuiz(true)}>
                    🎯 Drill Weak Topics ({weakTopicUnits().length} units)
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === "customquiz" && customQuizState && (
            <div className="page-view">
              <h2 style={{marginBottom:"1.5rem"}}>Custom Quiz</h2>
              {renderQuizQuestion(customQuizState, setCustomQuizState, false)}
            </div>
          )}

          {/* ===== PROGRESS ===== */}
          {activeTab === "tracker" && (
            <div className="page-view">
              <h2 style={{marginBottom:"0.5rem"}}>📊 Progress Tracker</h2>
              <p style={{color:"#64748b",fontSize:"0.85rem",marginBottom:"1.5rem"}}>
                Units visited: {Object.keys(visitedUnits).length} / {ALL_UNITS.length}
                {user && !user.isAnonymous && !user.isDemo && " · Synced to your account"}
              </p>
              <div className="visited-grid">
                {ALL_UNITS.map(u => (
                  <div key={u.id} className={`visited-chip ${visitedUnits[u.id]?"visited":""}`}
                    onClick={() => { setActiveUnit(u.id); setActiveTest(UNITS.test1.some(x=>x.id===u.id)?"test1":"test2"); setActiveTab("notes"); }}>
                    <span className="visited-id">{u.id}</span>
                    {visitedUnits[u.id] && <span className="visited-count">{visitedUnits[u.id]}x</span>}
                  </div>
                ))}
              </div>
              <h3 style={{margin:"2rem 0 1rem",color:"#94a3b8",fontSize:"0.9rem",textTransform:"uppercase",letterSpacing:"0.1em"}}>Quiz Performance by Topic</h3>
              {Object.keys(tracker).length === 0 ? (
                <div className="tracker-empty"><div style={{fontSize:"3rem"}}>📝</div><div style={{color:"#64748b",marginTop:"0.5rem"}}>Complete quizzes to see your performance here!</div></div>
              ) : (
                <div className="tracker-grid">
                  {Object.values(tracker).sort((a,b) => (a.correct/a.total)-(b.correct/b.total)).map((t,i) => {
                    const pct = Math.round((t.correct/t.total)*100);
                    const color = pct>=80?"#4ade80":pct>=50?"#facc15":"#f87171";
                    return (
                      <div key={i} className="tracker-card">
                        <div className="tracker-top"><span className="tracker-topic">{t.topic}</span><span className="tracker-unit">§{t.unit}</span></div>
                        <div className="tracker-bar-wrap"><div className="tracker-bar" style={{width:`${pct}%`,background:color}}/></div>
                        <div className="tracker-stats" style={{color}}>{pct}% <span style={{color:"#64748b",fontSize:"0.8rem"}}>({t.correct}/{t.total})</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== HISTORY ===== */}
          {activeTab === "history" && (
            <div className="page-view">
              <h2 style={{marginBottom:"0.5rem"}}>🗂 Quiz History</h2>
              <p style={{color:"#64748b",fontSize:"0.85rem",marginBottom:"1.5rem"}}>
                {quizLogs.length} quiz{quizLogs.length!==1?"zes":""} logged
                {user && !user.isAnonymous && !user.isDemo && " · Saved to your account"}
              </p>
              {quizLogs.length === 0 ? (
                <div className="tracker-empty"><div style={{fontSize:"3rem"}}>📋</div><div style={{color:"#64748b",marginTop:"0.5rem"}}>No quizzes taken yet!</div></div>
              ) : selectedLog ? (
                <div className="log-detail">
                  <button className="btn-ghost" style={{marginBottom:"1rem",fontSize:"0.85rem"}} onClick={() => setSelectedLog(null)}>← Back</button>
                  <div className="log-detail-header">
                    <div>
                      <div className="log-detail-title">{selectedLog.type} Quiz</div>
                      <div className="log-detail-meta">{new Date(selectedLog.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                    <div className="log-detail-score" style={{color:selectedLog.pct>=70?"#4ade80":"#f87171"}}>{selectedLog.pct}%</div>
                  </div>
                  <div className="log-questions">
                    {selectedLog.questions.map((q,i) => (
                      <div key={i} className="log-question-card">
                        <div className="log-q-header">
                          <span className="log-q-num">Q{i+1}</span>
                          <span className={`quiz-diff diff-${q.difficulty}`}>{q.difficulty}</span>
                          <span className="quiz-topic-tag">{q.topic} · {q.unit}</span>
                        </div>
                        <div className="log-q-text">{q.question}</div>
                        <div className="log-q-answers">
                          <div><span className="answer-label-sm">Your answer: </span><span style={{color:"#e2e8f0"}}>{q.userAnswer}</span></div>
                          <div><span className="answer-label-sm" style={{color:"#4ade80"}}>Correct: </span><span style={{color:"#86efac"}}>{q.correctAnswer}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="log-list">
                  {quizLogs.map((log,i) => {
                    const color = log.pct>=70?"#4ade80":log.pct>=50?"#facc15":"#f87171";
                    const date = new Date(log.date);
                    return (
                      <div key={i} className="log-card" onClick={() => setSelectedLog(log)}>
                        <div className="log-card-left">
                          <div className="log-score" style={{color}}>{log.pct}%</div>
                          <div className="log-bar-wrap"><div className="log-bar" style={{width:`${log.pct}%`,background:color}}/></div>
                        </div>
                        <div className="log-card-mid">
                          <div className="log-type">{log.type} Quiz</div>
                          <div className="log-meta">{log.score}/{log.total} correct</div>
                          <div className="log-topics">{[...new Set(log.questions.map(q=>q.unit))].map(u=><span key={u} className="log-unit-chip">§{u}</span>)}</div>
                        </div>
                        <div className="log-card-right">
                          <div className="log-date">{date.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                          <div className="log-view-btn">View →</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== CHEAT SHEET ===== */}
          {activeTab === "cheatsheet" && (
            <div className="page-view" style={{maxWidth:900}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem"}}>
                <h2 style={{margin:0}}>📄 Formula Cheat Sheet</h2>
                <button className="btn-secondary" style={{fontSize:"0.82rem"}} onClick={() => window.print()}>🖨 Print / Save PDF</button>
              </div>
              <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",marginBottom:"1.25rem"}}>
                {["All","Test 1","Test 2"].map(f => (
                  <button key={f} className="btn-ghost" style={{border:"1px solid #1e3a5f",borderRadius:6,padding:"0.25rem 0.7rem",fontSize:"0.82rem"}}
                    onClick={() => {
                      const el = document.getElementById("cs-content");
                      if (!el) return;
                      el.querySelectorAll(".cs-unit").forEach(u => {
                        const id = u.dataset.id;
                        const isT1 = UNITS.test1.some(x=>x.id===id);
                        u.style.display = (f==="All"||(f==="Test 1"&&isT1)||(f==="Test 2"&&!isT1))?"block":"none";
                      });
                    }}>{f}</button>
                ))}
              </div>
              <div id="cs-content">
                {ALL_UNITS.map(unit => (
                  <div key={unit.id} className="cs-unit" data-id={unit.id} style={{marginBottom:"1.25rem",background:"#0d1a2e",border:"1px solid #1e3a5f",borderRadius:10,padding:"1rem"}}>
                    <div style={{fontWeight:700,color:"#60a5fa",marginBottom:"0.6rem",fontSize:"0.95rem",borderBottom:"1px solid #1e3a5f",paddingBottom:"0.4rem"}}>{unit.name}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"0.4rem"}}>
                      {unit.formulas.map((f,i) => (
                        <div key={i} style={{fontFamily:"JetBrains Mono,monospace",fontSize:"0.78rem",color:"#c4b5fd",background:"#0a1628",borderRadius:5,padding:"0.3rem 0.6rem",borderLeft:"2px solid #7c3aed"}}>{f}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {activeTab === "settings" && (
            <div className="page-view">
              <h2 style={{marginBottom:"1.5rem"}}>⚙️ Settings</h2>

              <div className="settings-grid">
                <div className="settings-card">
                  <h3 className="settings-card-title">🎨 Appearance</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Theme</div>
                      <div className="settings-desc">Choose light or dark mode</div>
                    </div>
                    <div className="theme-toggle-row">
                      {["dark","light"].map(t => (
                        <button key={t} className={`theme-btn ${theme===t?"theme-btn-active":""}`}
                          onClick={() => setTheme(t)}>
                          {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Font Size</div>
                      <div className="settings-desc">Adjust text size across the app</div>
                    </div>
                    <div className="theme-toggle-row">
                      {["small","medium","large"].map(s => (
                        <button key={s} className={`theme-btn ${fontSize===s?"theme-btn-active":""}`}
                          onClick={() => setFontSize(s)} style={{textTransform:"capitalize"}}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">👤 Account</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Signed in as</div>
                      <div className="settings-desc">{user.email || (user.isAnonymous ? "Guest (no account)" : displayName)}</div>
                    </div>
                    {user.isAnonymous && (
                      <button className="sug-btn" onClick={handleSignOut}>Create Account →</button>
                    )}
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Data Sync</div>
                      <div className="settings-desc">{user.isAnonymous || user.isDemo ? "Not syncing — guest session only" : "Progress synced to Firebase"}</div>
                    </div>
                    <div style={{fontSize:"0.8rem",color: user.isAnonymous ? "#f87171" : "#4ade80"}}>
                      {user.isAnonymous ? "● Local only" : "● Cloud synced"}
                    </div>
                  </div>
                  <button className="settings-signout-btn" onClick={handleSignOut}>Sign Out</button>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">📊 Your Stats</h3>
                  <div className="settings-stat-row"><span>Units studied</span><strong>{Object.keys(visitedUnits).length} / {ALL_UNITS.length}</strong></div>
                  <div className="settings-stat-row"><span>Quizzes taken</span><strong>{quizLogs.length}</strong></div>
                  <div className="settings-stat-row"><span>Topics practiced</span><strong>{Object.keys(tracker).length}</strong></div>
                  <div className="settings-stat-row"><span>Avg quiz score</span><strong>{avgScore !== null ? avgScore+"%" : "—"}</strong></div>
                  <button className="settings-danger-btn" style={{marginTop:"1rem"}}
                    onClick={() => { if(window.confirm("Reset all progress? This cannot be undone.")) { setTracker({}); setQuizLogs([]); setVisitedUnits({}); }}}>
                    🗑 Reset All Progress
                  </button>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">💬 AI Tutor</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Chat History</div>
                      <div className="settings-desc">{chatMessages.length - 1} messages in current session</div>
                    </div>
                    <button className="sug-btn" onClick={() => { setChatMessages([{ role: "assistant", content: "Hi! I'm your Calc 2 tutor. Ask me anything!" }]); }}>
                      Clear Chat
                    </button>
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Open Tutor</div>
                      <div className="settings-desc">Chat with the AI tutor from any tab</div>
                    </div>
                    <button className="sug-btn" onClick={() => setChatOpen(true)}>Open →</button>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">ℹ️ About</h3>
                  <div className="settings-stat-row"><span>App</span><strong>Calc2Pro</strong></div>
                  <div className="settings-stat-row"><span>Units covered</span><strong>25 (Test 1 + Test 2)</strong></div>
                  <div className="settings-stat-row"><span>Questions</span><strong>28 (Easy / Medium / Hard)</strong></div>
                  <div className="settings-stat-row"><span>AI Model</span><strong>Claude Sonnet</strong></div>
                  <div style={{marginTop:"0.75rem",fontSize:"0.8rem",color:"#64748b",lineHeight:"1.5"}}>
                    Built to help you study integrals, series, parametric curves, polar coordinates, and everything else in Calc 2.
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ===== FLOATING CHAT BUBBLE ===== */}
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="Calc 2 Tutor">
        {chatOpen ? "✕" : "💬"}
        {!chatOpen && chatMessages.length > 1 && <span className="chat-fab-badge">{chatMessages.filter(m=>m.role==="assistant").length}</span>}
      </button>

      {chatOpen && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div className="chat-avatar-sm">∫</div>
            <div>
              <div style={{fontWeight:700,fontSize:"0.95rem"}}>Calc 2 Tutor</div>
              <div style={{fontSize:"0.75rem",color:chatCount >= CHAT_LIMIT ? "#f87171" : "#4ade80"}}>
                {chatCount >= CHAT_LIMIT ? "🔒 Limit reached" : `● Online · ${CHAT_LIMIT - chatCount} msgs left`}
              </div>
            </div>
            <button className="btn-ghost" style={{marginLeft:"auto"}} onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((m,i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="msg-bubble">{m.content}</div>
              </div>
            ))}
            {chatLoading && <div className="chat-msg assistant"><div className="msg-bubble typing"><span/><span/><span/></div></div>}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            {chatCount >= CHAT_LIMIT ? (
              <div style={{background:"#1a0a0a",border:"1px solid #991b1b",borderRadius:8,padding:"0.9rem 1rem",textAlign:"center",fontSize:"0.85rem",color:"#f87171",lineHeight:1.6}}>
                🔒 You've used all {CHAT_LIMIT} free messages.<br/>
                <span style={{color:"#64748b",fontSize:"0.78rem"}}>Subscription coming soon — check back later!</span>
              </div>
            ) : (
              <>
                <textarea className="chat-input" value={chatInput} rows={2}
                  placeholder="Ask about a concept or formula…"
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();} }} />
                <div className="chat-input-actions">
                  <button className="btn-ghost" style={{fontSize:"0.8rem"}} onClick={() => setShowCalcKeyboard(s=>!s)}>∫</button>
                  <button className="btn-primary" onClick={sendChat} disabled={chatLoading}>Send</button>
                </div>
                {showCalcKeyboard && <CalcKeyboard onInsert={sym => setChatInput(s => s + sym)} />}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================
// CALCULATOR KEYBOARD
// ============================================================
function CalcKeyboard({ onInsert }) {
  const rows = [
    ["∫","∫∫","∮","Σ","∏","lim","→"],
    ["√","∛","∞","π","e","θ","α"],
    ["≤","≥","≠","≈","∈","⊂","∅"],
    ["∂","∇","∆","±","×","÷","·"],
    ["sin","cos","tan","csc","sec","cot","ln"],
    ["arcsin","arccos","arctan","d/dx","dy/dx","∫[a,b]","Rⁿ"],
    ["¹","²","³","ⁿ","₀","₁","ₙ"],
    ["⁺","⁻","½","⅓","⅔","⅛","∣"],
  ];
  return (
    <div className="calc-keyboard">
      <div className="calc-keyboard-title">Click to insert symbol</div>
      {rows.map((row,r) => (
        <div key={r} className="calc-row">
          {row.map((s,c) => <button key={c} className="calc-key" onClick={() => onInsert(s)}>{s}</button>)}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SVG GRAPHS (same as before)
// ============================================================
function GraphViz({ unit, graphIndex }) {
  const key = `${unit}-${graphIndex}`;
  const graphs = {
    "5.4-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="160" x2="280" y2="160" stroke="#334155" strokeWidth="1"/>
        <line x1="40" y1="10" x2="40" y2="160" stroke="#334155" strokeWidth="1"/>
        {[0,20,40,60].map((offset,i) => (
          <path key={i} d={`M40,${140-offset} Q100,${60-offset} 160,${80-offset} Q220,${100-offset} 260,${40-offset}`}
            fill="none" stroke={`hsl(${210+i*20},80%,${55+i*8}%)`} strokeWidth="2" strokeDasharray={i===0?"none":"4,3"}/>
        ))}
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">F(x)+C family</text>
      </svg>
    ),
    "5.4-1": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="120" x2="280" y2="120" stroke="#334155" strokeWidth="1"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#334155" strokeWidth="1"/>
        <path d="M60,120 Q100,40 130,80 Q160,100 200,30 Q230,10 260,60" fill="none" stroke="#22d3ee" strokeWidth="2.5"/>
        <path d="M80,120 L80,85 L200,85 L200,120 Z" fill="rgba(34,211,238,0.2)"/>
        <text x="80" y="135" fill="#94a3b8" fontSize="10" textAnchor="middle">a</text>
        <text x="200" y="135" fill="#94a3b8" fontSize="10" textAnchor="middle">b</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Net Change = F(b) − F(a)</text>
      </svg>
    ),
    "5.5-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="140" x2="280" y2="140" stroke="#334155" strokeWidth="1"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#334155" strokeWidth="1"/>
        <path d="M60,140 Q120,20 250,80" fill="none" stroke="#60a5fa" strokeWidth="2.5"/>
        <path d="M70,140 L70,110 L90,110 L90,140 Z" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1"/>
        <path d="M110,140 L110,60 L140,60 L140,140 Z" fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth="1"/>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">u=g(x) transforms the integrand</text>
      </svg>
    ),
    "5.5-1": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="150" y1="10" x2="150" y2="160" stroke="#334155" strokeWidth="1"/>
        <line x1="20" y1="90" x2="280" y2="90" stroke="#334155" strokeWidth="1"/>
        <path d={Array.from({length:200},(_,i)=>{const x=(i-100)/30;const y=Math.cos(x)*40;return `${i===0?"M":"L"}${150+x*30},${90-y}`;}).join(" ")} fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="2"/>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Even: symmetric about y-axis</text>
      </svg>
    ),
    "6.1-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="150" x2="280" y2="150" stroke="#334155" strokeWidth="1"/>
        <line x1="40" y1="10" x2="40" y2="160" stroke="#334155" strokeWidth="1"/>
        <path d="M60,150 Q120,20 250,60" fill="none" stroke="#60a5fa" strokeWidth="2.5"/>
        <path d="M60,150 Q100,100 180,130 Q220,140 250,120" fill="none" stroke="#f472b6" strokeWidth="2.5"/>
        <path d="M60,150 Q120,20 250,60 L250,120 Q220,140 180,130 Q100,100 60,150 Z" fill="rgba(167,139,250,0.2)"/>
        <text x="155" y="80" fill="#60a5fa" fontSize="10">f(x)</text>
        <text x="175" y="138" fill="#f472b6" fontSize="10">g(x)</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Area = ∫[f(x)−g(x)] dx</text>
      </svg>
    ),
    "6.2-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <ellipse cx="150" cy="90" rx="80" ry="40" fill="#3b82f6" fillOpacity="0.15" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,3"/>
        <path d="M60,40 Q100,20 150,50 Q200,20 240,40 L240,140 Q200,160 150,130 Q100,160 60,140 Z" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="1.5"/>
        <text x="150" y="90" fill="#60a5fa" fontSize="12" textAnchor="middle" dominantBaseline="middle">Disk</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">V = π∫[f(x)]² dx</text>
      </svg>
    ),
    "6.2-1": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <ellipse cx="150" cy="90" rx="80" ry="40" fill="rgba(59,130,246,0.1)" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,3"/>
        <ellipse cx="150" cy="90" rx="40" ry="20" fill="#080f1e" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x="190" y="82" fill="#60a5fa" fontSize="9">R</text>
        <text x="162" y="88" fill="#f472b6" fontSize="9">r</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">V = π∫(R² − r²) dx</text>
      </svg>
    ),
    "6.3-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <ellipse cx="150" cy="100" rx="100" ry="20" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
        <ellipse cx="150" cy="60" rx="60" ry="12" fill="none" stroke="#a78bfa" strokeWidth="1"/>
        <line x1="50" y1="100" x2="50" y2="60" stroke="#a78bfa" strokeWidth="1.5"/>
        <line x1="250" y1="100" x2="250" y2="60" stroke="#a78bfa" strokeWidth="1.5"/>
        <line x1="150" y1="10" x2="150" y2="150" stroke="#64748b" strokeWidth="1" strokeDasharray="3,2"/>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">V = 2π∫ x·f(x) dx</text>
      </svg>
    ),
    "7.1-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <rect x="60" y="40" width="120" height="80" fill="rgba(59,130,246,0.1)" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x="120" y="85" fill="#60a5fa" fontSize="12" textAnchor="middle">uv</text>
        <path d="M60,120 Q100,60 180,120" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="2"/>
        <text x="110" y="140" fill="#a78bfa" fontSize="10">∫v du</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">∫u dv = uv − ∫v du</text>
      </svg>
    ),
    "7.3-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <polygon points="30,150 90,150 30,80" fill="#3b82f6" fillOpacity="0.2" stroke="#60a5fa" strokeWidth="1.5"/>
        <text x="55" y="165" fill="#60a5fa" fontSize="9" textAnchor="middle">a</text>
        <text x="18" y="118" fill="#60a5fa" fontSize="8">√(a²−x²)</text>
        <text x="48" y="88" fill="#94a3b8" fontSize="8">x=a sinθ</text>
        <polygon points="120,150 200,150 120,70" fill="#a78bfa" fillOpacity="0.2" stroke="#c084fc" strokeWidth="1.5"/>
        <text x="160" y="165" fill="#c084fc" fontSize="9" textAnchor="middle">a</text>
        <text x="140" y="75" fill="#94a3b8" fontSize="8">x=a tanθ</text>
        <polygon points="220,150 280,150 220,90" fill="#34d399" fillOpacity="0.2" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="250" y="165" fill="#4ade80" fontSize="9" textAnchor="middle">a</text>
        <text x="238" y="95" fill="#94a3b8" fontSize="8">x=a secθ</text>
        <text x="150" y="178" fill="#64748b" fontSize="10" textAnchor="middle">Three Trig Sub Cases</text>
      </svg>
    ),
    "7.8-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="150" x2="280" y2="150" stroke="#334155" strokeWidth="1"/>
        <line x1="40" y1="10" x2="40" y2="160" stroke="#334155" strokeWidth="1"/>
        <path d="M50,20 Q70,80 120,130 Q180,148 270,150" fill="none" stroke="#22d3ee" strokeWidth="2.5"/>
        <path d="M50,20 Q70,80 120,130 Q180,148 270,150 L270,150 L50,150 Z" fill="rgba(34,211,238,0.15)"/>
        <text x="100" y="60" fill="#22d3ee" fontSize="10">1/x² converges</text>
        <path d="M50,30 Q70,70 110,100 Q160,130 270,148" fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="5,3"/>
        <text x="210" y="143" fill="#f87171" fontSize="9">1/x diverges</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">p-integral: converges iff p &gt; 1</text>
      </svg>
    ),
    "8.1-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="150" x2="280" y2="150" stroke="#334155" strokeWidth="1"/>
        <path d="M60,120 Q100,50 160,80 Q210,100 250,40" fill="none" stroke="#60a5fa" strokeWidth="2.5"/>
        {[[60,120],[100,74],[140,66],[180,87],[220,65],[250,40]].map(([x,y],i,arr) => i<arr.length-1 && (
          <line key={i} x1={x} y1={y} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke="#f59e0b" strokeWidth="1.5" opacity="0.8"/>
        ))}
        {[[60,120],[100,74],[140,66],[180,87],[220,65],[250,40]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#f59e0b"/>
        ))}
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Secant polygons → arc length</text>
      </svg>
    ),
    "10.1-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="150" x2="280" y2="150" stroke="#334155" strokeWidth="1"/>
        <path d="M30,150 Q40,110 55,95 Q70,82 85,90 Q100,98 110,118 Q120,138 130,148 Q140,152 150,148 Q160,138 170,118 Q180,98 190,88 Q200,78 215,90 Q230,100 240,118 Q250,135 260,148" fill="none" stroke="#f59e0b" strokeWidth="2.5"/>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Cycloid: x=r(t−sin t), y=r(1−cos t)</text>
      </svg>
    ),
    "10.1-1": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <path d={Array.from({length:628},(_,i)=>{const t=i/100;const x=Math.sin(3*t+0.5);const y=Math.sin(2*t);return `${i===0?"M":"L"}${150+x*90},${90-y*70}`;}).join(" ")} fill="none" stroke="#c084fc" strokeWidth="2"/>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Lissajous — self-intersecting curve</text>
      </svg>
    ),
    "10.3-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        {[30,60,90].map((r,i) => <circle key={i} cx="150" cy="90" r={r} fill="none" stroke="#1e3a5f" strokeWidth="1"/>)}
        {[0,45,90,135].map((a,i) => { const rad=a*Math.PI/180; return <line key={i} x1="150" y1="90" x2={150+95*Math.cos(rad)} y2={90-95*Math.sin(rad)} stroke="#1e3a5f" strokeWidth="1"/>})}
        <path d={Array.from({length:361},(_,i)=>{const t=i*Math.PI/180;const r=(1+Math.cos(t))*45;return `${i===0?"M":"L"}${150+r*Math.cos(t)},${90-r*Math.sin(t)}`;}).join(" ")} fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2"/>
        <path d={Array.from({length:361},(_,i)=>{const t=i*Math.PI/180;const r=Math.max(0,Math.cos(2*t))*35;return `${i===0?"M":"L"}${150+r*Math.cos(t)},${90-r*Math.sin(t)}`;}).join(" ")} fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Cardioid (gold) + Rose (blue)</text>
      </svg>
    ),
    "10.4-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        {[30,60,90].map((r,i) => <circle key={i} cx="150" cy="90" r={r} fill="none" stroke="#1e3a5f" strokeWidth="1"/>)}
        <path d={Array.from({length:91},(_,i)=>{const t=i*Math.PI/180;const r=(1+Math.cos(t))*45;return `${i===0?"M":"L"}${150+r*Math.cos(t)},${90-r*Math.sin(t)}`;}).join(" ")+" L150,90 Z"} fill="rgba(167,139,250,0.3)" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">A = ½∫r(θ)² dθ</text>
      </svg>
    ),
    "11.1-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="130" x2="280" y2="130" stroke="#334155" strokeWidth="1"/>
        <line x1="40" y1="20" x2="40" y2="140" stroke="#334155" strokeWidth="1"/>
        {[1,2,3,4,5,6,7,8,9,10].map(n => <circle key={n} cx={40+n*22} cy={130-100/n} r="4" fill="#4ade80" fillOpacity="0.8"/>)}
        <line x1="40" y1="130" x2="280" y2="130" stroke="#4ade80" strokeWidth="1" strokeDasharray="4,3"/>
        {[1,2,3,4,5,6,7,8,9,10].map(n => <circle key={n} cx={40+n*22} cy={n%2===0?55:95} r="4" fill="#f87171" fillOpacity="0.8"/>)}
        <text x="80" y="48" fill="#4ade80" fontSize="9">1/n → 0</text>
        <text x="80" y="110" fill="#f87171" fontSize="9">(−1)ⁿ diverges</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Convergent vs Divergent</text>
      </svg>
    ),
    "11.10-0": () => (
      <svg viewBox="0 0 300 180" className="graph-svg">
        <line x1="20" y1="100" x2="280" y2="100" stroke="#334155" strokeWidth="1"/>
        <line x1="150" y1="10" x2="150" y2="160" stroke="#334155" strokeWidth="1"/>
        <path d={Array.from({length:201},(_,i)=>{const x=(i-100)/20;return `${i===0?"M":"L"}${150+x*50},${100-Math.sin(x)*50}`;}).join(" ")} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.3"/>
        <path d={Array.from({length:201},(_,i)=>{const x=(i-100)/20;return `${i===0?"M":"L"}${150+x*50},${100-x*50}`;}).join(" ")} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4,2"/>
        <path d={Array.from({length:201},(_,i)=>{const x=(i-100)/20;const y=x-x**3/6;return `${i===0?"M":"L"}${150+x*50},${100-y*50}`;}).join(" ")} fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
        <path d={Array.from({length:201},(_,i)=>{const x=(i-100)/20;const y=x-x**3/6+x**5/120;return `${i===0?"M":"L"}${150+x*50},${100-y*50}`;}).join(" ")} fill="none" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="255" y="50" fill="#f87171" fontSize="9">T₁</text>
        <text x="255" y="65" fill="#f59e0b" fontSize="9">T₃</text>
        <text x="255" y="80" fill="#4ade80" fontSize="9">T₅</text>
        <text x="150" y="175" fill="#64748b" fontSize="11" textAnchor="middle">Taylor polynomials → sin(x)</text>
      </svg>
    ),
  };
  const render = graphs[key];
  if (render) return render();
  return (
    <svg viewBox="0 0 300 180" className="graph-svg">
      <text x="150" y="90" fill="#475569" fontSize="13" textAnchor="middle" dominantBaseline="middle">📊 Visualization</text>
    </svg>
  );
}

// ============================================================
// AUTH STYLES
// ============================================================
// ============================================================
// LANDING PAGE STYLES
// ============================================================
const LANDING_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #080f1e; overflow-x: hidden; }
  .landing-wrap { min-height: 100vh; width: 100vw; background: #080f1e; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }
  .landing-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse at 20% 10%, rgba(29,78,216,0.2) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 90%, rgba(124,58,237,0.15) 0%, transparent 55%); }
  .landing-nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 2rem; background: rgba(8,15,30,0.85); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(30,58,95,0.5); }
  .landing-nav-logo { display: flex; align-items: center; gap: 0.6rem; }
  .landing-logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg,#1d4ed8,#7c3aed); border-radius: 9px;
    display: flex; align-items: center; justify-content: center; font-family: serif; font-size: 1.3rem; color: white; }
  .landing-logo-text { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 900; color: #e2e8f0; }
  .landing-login-btn { background: #1d4ed8; border: none; border-radius: 8px; padding: 0.5rem 1.2rem;
    color: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600; transition: opacity 0.15s; }
  .landing-login-btn:hover { opacity: 0.85; }
  .landing-hero { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; padding: 5rem 2rem 3rem; text-align: center; }
  .landing-badge { display: inline-block; background: rgba(29,78,216,0.2); border: 1px solid rgba(59,130,246,0.4);
    border-radius: 20px; padding: 0.3rem 1rem; font-size: 0.82rem; color: #60a5fa; margin-bottom: 1.5rem; letter-spacing: 0.05em; }
  .landing-h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 6vw, 4.5rem); font-weight: 900;
    line-height: 1.1; color: #e2e8f0; margin-bottom: 1.25rem;
    background: linear-gradient(135deg, #e2e8f0 40%, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .landing-sub { font-size: 1.1rem; color: #94a3b8; line-height: 1.7; max-width: 580px; margin: 0 auto 2rem; }
  .landing-cta-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2.5rem; }
  .landing-cta-primary { background: linear-gradient(135deg,#1d4ed8,#7c3aed); border: none; border-radius: 12px;
    padding: 0.85rem 2rem; color: white; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 1rem; font-weight: 700; box-shadow: 0 0 30px rgba(99,102,241,0.4); transition: transform 0.15s, opacity 0.15s; }
  .landing-cta-primary:hover { transform: translateY(-2px); opacity: 0.9; }
  .landing-cta-secondary { background: rgba(30,58,95,0.4); border: 1px solid #1e3a5f; border-radius: 12px;
    padding: 0.85rem 2rem; color: #94a3b8; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 1rem; font-weight: 600; transition: all 0.15s; }
  .landing-cta-secondary:hover { border-color: #3b82f6; color: #e2e8f0; }
  .landing-topics { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
  .landing-topic-chip { background: rgba(30,58,95,0.4); border: 1px solid #1e3a5f; border-radius: 20px;
    padding: 0.25rem 0.75rem; font-size: 0.78rem; color: #64748b; }
  .landing-features { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 4rem 2rem; }
  .landing-section-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: #e2e8f0;
    text-align: center; margin-bottom: 2rem; }
  .landing-features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
  .landing-feature-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 14px; padding: 1.5rem;
    transition: border-color 0.2s, transform 0.2s; }
  .landing-feature-card:hover { border-color: #3b82f6; transform: translateY(-3px); }
  .landing-feature-icon { font-size: 2rem; margin-bottom: 0.75rem; }
  .landing-feature-title { font-weight: 700; font-size: 1rem; color: #e2e8f0; margin-bottom: 0.5rem; }
  .landing-feature-desc { font-size: 0.85rem; color: #64748b; line-height: 1.6; }
  .landing-bottom-cta { position: relative; z-index: 1; text-align: center; padding: 4rem 2rem;
    background: linear-gradient(180deg, transparent, rgba(29,78,216,0.08)); }
  .landing-bottom-cta h2 { font-family: 'Playfair Display', serif; font-size: 2rem; color: #e2e8f0; margin-bottom: 0.75rem; }
  .landing-bottom-cta p { color: #64748b; margin-bottom: 1.5rem; }
  .landing-footer { text-align: center; padding: 1.5rem; color: #334155; font-size: 0.8rem; border-top: 1px solid #0d1a2e; }
`;

const AUTH_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; }
  .auth-wrap {
    min-height: 100vh; width: 100vw;
    display: grid; place-items: center;
    background: #080f1e; padding: 1.5rem;
    font-family: 'DM Sans', sans-serif;
  }
  .auth-bg {
    position: fixed; inset: 0; z-index: 0;
    background: radial-gradient(ellipse at 30% 20%, rgba(29,78,216,0.18) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 80%, rgba(124,58,237,0.12) 0%, transparent 60%);
  }
  .auth-card {
    position: relative; z-index: 1;
    width: min(480px, 100%);
    background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 20px;
    padding: 2.5rem 2rem; display: flex; flex-direction: column; gap: 0.75rem;
    box-shadow: 0 0 60px rgba(30,58,95,0.5);
  }
  .auth-logo {
    width: 56px; height: 56px; margin: 0 auto 0.25rem;
    background: linear-gradient(135deg, #1d4ed8, #7c3aed); border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; color: white; font-family: serif;
    box-shadow: 0 0 24px rgba(99,102,241,0.4);
  }
  .auth-title { font-size: 1.8rem; font-weight: 900; color: #e2e8f0; text-align: center; font-family: 'Playfair Display', serif; }
  .auth-sub { font-size: 0.88rem; color: #64748b; text-align: center; }
  .auth-error { background: #450a0a; border: 1px solid #991b1b; border-radius: 8px; padding: 0.65rem 0.9rem; color: #fca5a5; font-size: 0.85rem; }
  .btn-google {
    display: flex; align-items: center; justify-content: center; gap: 0.6rem;
    background: white; border: none; border-radius: 10px; padding: 0.7rem;
    color: #1a1a1a; cursor: pointer; font-size: 0.92rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
  }
  .btn-google:hover { opacity: 0.9; }
  .auth-divider { display: flex; align-items: center; gap: 0.75rem; }
  .auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: #1e3a5f; }
  .auth-divider span { color: #334155; font-size: 0.8rem; }
  .auth-tabs { display: flex; gap: 0.4rem; background: #0a1628; border-radius: 8px; padding: 3px; }
  .auth-tab { flex: 1; padding: 0.45rem; border: none; border-radius: 6px; background: none; color: #64748b; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; transition: all 0.15s; }
  .auth-tab.active { background: #1e3a5f; color: #e2e8f0; }
  .auth-input { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 10px; padding: 0.7rem 0.9rem; color: #e2e8f0; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.15s; }
  .auth-input:focus { border-color: #3b82f6; }
  .btn-primary-auth { background: linear-gradient(135deg, #1d4ed8, #7c3aed); border: none; border-radius: 10px; padding: 0.75rem; color: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 700; transition: opacity 0.15s; }
  .btn-primary-auth:hover { opacity: 0.88; }
  .btn-primary-auth:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-guest { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 10px; padding: 0.65rem; color: #94a3b8; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; transition: all 0.15s; }
  .btn-guest:hover { border-color: #3b82f6; color: #60a5fa; }
  .guest-note { color: #475569; font-size: 0.8rem; }
  .btn-demo { background: none; border: 1px dashed #334155; border-radius: 10px; padding: 0.6rem; color: #4a5568; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; transition: all 0.15s; }
  .btn-demo:hover { color: #64748b; border-color: #475569; }
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
  .app { height: 100vh; width: 100vw; background: #080f1e; color: #e2e8f0; font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; overflow: hidden; }

  /* HEADER */
  .app-header { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 1.25rem; background: #0d1a2e; border-bottom: 1px solid #1e3a5f; position: sticky; top: 0; z-index: 200; gap: 0.75rem; flex-shrink: 0; }
  .header-left { display: flex; align-items: center; gap: 0.75rem; }
  .sidebar-toggle { background: none; border: 1px solid #1e3a5f; border-radius: 7px; color: #64748b; cursor: pointer; font-size: 1rem; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
  .sidebar-toggle:hover { background: #1e3a5f; color: #cbd5e1; }
  .logo { width: 36px; height: 36px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1.3rem; color: white; box-shadow: 0 0 16px rgba(99,102,241,0.4); flex-shrink: 0; }
  .app-title-wrap { display: flex; flex-direction: column; }
  .app-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 900; color: #e2e8f0; line-height: 1.1; }
  .app-subtitle { font-size: 0.65rem; color: #4ade80; letter-spacing: 0.1em; text-transform: uppercase; }
  .header-right { display: flex; align-items: center; gap: 0.6rem; margin-left: auto; }
  .sync-badge { font-size: 0.72rem; color: #64748b; padding: 2px 8px; background: #0a1628; border-radius: 20px; border: 1px solid #1e3a5f; }
  .sync-badge.saved { color: #4ade80; border-color: #166534; }
  .guest-badge { font-size: 0.72rem; color: #f59e0b; background: #422006; border: 1px solid #92400e; padding: 2px 8px; border-radius: 20px; }
  .user-avatar { width: 30px; height: 30px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: white; cursor: default; }

  /* BODY LAYOUT */
  .app-body { display: flex; flex: 1; height: calc(100vh - 53px); overflow: hidden; }

  /* SIDEBAR */
  .sidebar { background: #0a1628; border-right: 1px solid #1e3a5f; display: flex; flex-direction: column; transition: width 0.2s ease; overflow: hidden; flex-shrink: 0; }
  .sidebar-open { width: 220px; }
  .sidebar-closed { width: 52px; }
  .side-nav { display: flex; flex-direction: column; gap: 0.15rem; padding: 0.6rem 0.4rem; flex-shrink: 0; }
  .side-nav-btn { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.6rem; border-radius: 8px; border: none; background: none; color: #64748b; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500; transition: all 0.12s; white-space: nowrap; width: 100%; text-align: left; }
  .side-nav-btn:hover { background: #1e3a5f; color: #cbd5e1; }
  .side-nav-active { background: #1e3a5f !important; color: #60a5fa !important; }
  .side-nav-icon { font-size: 1rem; flex-shrink: 0; width: 20px; text-align: center; }
  .side-nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

  /* UNIT PANEL inside sidebar */
  .unit-panel { flex: 1; overflow-y: auto; border-top: 1px solid #1e3a5f; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; }
  .test-toggle { display: flex; gap: 0.3rem; }
  .test-btn { flex: 1; padding: 0.35rem; border-radius: 6px; border: 1px solid #1e3a5f; background: none; color: #64748b; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 600; transition: all 0.12s; }
  .test-btn.active { background: #1d4ed8; border-color: #3b82f6; color: white; }
  .unit-list { display: flex; flex-direction: column; gap: 0.15rem; }
  .unit-btn { display: flex; align-items: flex-start; gap: 0.4rem; padding: 0.4rem 0.5rem; border-radius: 6px; border: none; background: none; color: #94a3b8; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; text-align: left; line-height: 1.3; transition: all 0.1s; width: 100%; }
  .unit-btn:hover { background: #1e3a5f; color: #cbd5e1; }
  .unit-active { background: #1e3a5f !important; color: #60a5fa !important; }
  .unit-id { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: #3b82f6; flex-shrink: 0; margin-top: 1px; }
  .unit-name { flex: 1; }
  .unit-visited { color: #4ade80; font-size: 0.5rem; margin-left: auto; flex-shrink: 0; margin-top: 4px; }

  /* MAIN CONTENT */
  .main-content { flex: 1; overflow-y: auto; padding: 1.5rem; min-width: 0; }

  /* PAGE VIEWS — full width */
  .page-view { width: 100%; }

  /* HOME */
  .home-view { width: 100%; }
  .home-welcome { margin-bottom: 1.5rem; }
  .home-greeting { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900; color: #e2e8f0; }
  .home-sub { font-size: 0.9rem; color: #64748b; margin-top: 0.25rem; }
  .home-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
  @media (max-width: 700px) { .home-stats-row { grid-template-columns: repeat(2, 1fr); } }
  .stat-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 12px; padding: 1.1rem; text-align: center; }
  .stat-number { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: #60a5fa; line-height: 1; }
  .stat-denom { font-size: 1rem; color: #334155; font-weight: 400; font-family: 'DM Sans', sans-serif; }
  .stat-label { font-size: 0.78rem; color: #64748b; margin-top: 0.4rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .home-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 800px) { .home-grid { grid-template-columns: 1fr; } }
  .home-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 12px; padding: 1.25rem; }
  .home-card-title { font-size: 0.9rem; font-weight: 700; color: #60a5fa; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #1e3a5f; }
  .home-empty-msg { color: #475569; font-size: 0.85rem; }
  .suggestion-item { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.9rem; }
  .sug-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
  .sug-title { font-weight: 600; font-size: 0.88rem; color: #cbd5e1; }
  .sug-desc { font-size: 0.78rem; color: #64748b; margin: 0.2rem 0 0.4rem; }
  .sug-btn { background: none; border: 1px solid #1e3a5f; border-radius: 6px; padding: 0.25rem 0.7rem; color: #60a5fa; cursor: pointer; font-size: 0.78rem; font-family: 'DM Sans', sans-serif; transition: all 0.12s; }
  .sug-btn:hover { background: #1e3a5f; }
  .strength-item { margin-bottom: 0.75rem; }
  .strength-top { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
  .strength-topic { font-size: 0.85rem; color: #cbd5e1; }
  .strength-pct { font-size: 0.85rem; font-weight: 700; }
  .recent-quiz-score { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 900; line-height: 1; margin-bottom: 0.4rem; }
  .coverage-bar-wrap { height: 8px; background: #1e3a5f; border-radius: 4px; overflow: hidden; margin-top: 0.6rem; }
  .coverage-bar { height: 100%; background: linear-gradient(90deg, #1d4ed8, #7c3aed); border-radius: 4px; transition: width 0.5s ease; }
  .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
  .quick-action-btn { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 9px; padding: 0.65rem 0.5rem; color: #94a3b8; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600; transition: all 0.12s; text-align: center; }
  .quick-action-btn:hover { background: #1e3a5f; color: #e2e8f0; border-color: #3b82f6; }

  /* NOTES */
  .notes-view { width: 100%; }
  .notes-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .notes-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: #e2e8f0; line-height: 1.2; }
  .btn-quiz-unit { background: linear-gradient(135deg,#1d4ed8,#7c3aed); border: none; border-radius: 8px; padding: 0.55rem 1.1rem; color: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; white-space: nowrap; transition: opacity 0.15s; }
  .btn-quiz-unit:hover { opacity: 0.85; }
  .notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 720px) { .notes-grid { grid-template-columns: 1fr; } }
  .notes-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 12px; padding: 1.1rem; }
  .full-width { grid-column: 1 / -1; }
  .card-title { font-size: 0.95rem; font-weight: 700; color: #60a5fa; margin-bottom: 0.9rem; padding-bottom: 0.45rem; border-bottom: 1px solid #1e3a5f; }
  .concept-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
  .concept-item { padding: 0.5rem 0.65rem; background: #0a1628; border-radius: 6px; border-left: 3px solid #1d4ed8; font-size: 0.85rem; line-height: 1.5; color: #cbd5e1; }
  .concept-item strong { color: #60a5fa; }
  .formula-list { display: flex; flex-direction: column; gap: 0.45rem; }
  .formula-item { padding: 0.45rem 0.65rem; background: #0a1628; border-radius: 6px; border-left: 3px solid #7c3aed; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c4b5fd; line-height: 1.4; }
  .graph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
  .graph-card { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 10px; padding: 0.75rem; }
  .graph-svg { width: 100%; height: auto; border-radius: 6px; background: #080f1e; margin-bottom: 0.5rem; }
  .graph-label { font-weight: 700; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.2rem; }
  .graph-desc { font-size: 0.78rem; color: #64748b; line-height: 1.4; }

  /* QUIZ */
  .quiz-active { display: flex; flex-direction: column; gap: 1rem; }
  .quiz-header { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding-bottom: 0.75rem; border-bottom: 1px solid #1e3a5f; }
  .quiz-progress { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: #60a5fa; font-weight: 700; }
  .quiz-topic-tag { background: #1e3a5f; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; color: #94a3b8; }
  .quiz-diff { padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .diff-easy { background: #052e16; color: #4ade80; border: 1px solid #166534; }
  .diff-medium { background: #422006; color: #fbbf24; border: 1px solid #92400e; }
  .diff-hard { background: #450a0a; color: #f87171; border: 1px solid #991b1b; }
  .quiz-question { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 10px; padding: 1.1rem; font-size: 1rem; font-family: 'JetBrains Mono', monospace; color: #e2e8f0; line-height: 1.5; }
  .quiz-input { width: 100%; background: #0a1628; border: 1px solid #1e3a5f; border-radius: 8px; padding: 0.7rem; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; resize: vertical; outline: none; }
  .quiz-input:focus { border-color: #3b82f6; }
  .quiz-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
  .answer-reveal { background: #0a2a0a; border: 1px solid #166534; border-radius: 10px; padding: 0.9rem 1.1rem; }
  .answer-label { color: #4ade80; font-weight: 700; font-size: 0.82rem; margin-bottom: 0.35rem; }
  .answer-text { font-family: 'JetBrains Mono', monospace; color: #86efac; font-size: 0.88rem; line-height: 1.6; }
  .btn-correct { background: #052e16; border: 1px solid #166534; border-radius: 6px; padding: 0.3rem 0.8rem; color: #4ade80; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; }
  .btn-wrong { background: #450a0a; border: 1px solid #991b1b; border-radius: 6px; padding: 0.3rem 0.8rem; color: #f87171; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; }
  .quiz-results { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; }
  .results-score { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 900; }
  .results-breakdown { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0; text-align: left; }
  .result-row { background: #0d1a2e; border-radius: 8px; padding: 0.75rem 1rem; }
  .result-q { font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem; }
  .result-answer-row { display: flex; flex-direction: column; gap: 0.3rem; }
  .result-your-answer, .result-correct-answer { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
  .answer-label-sm { font-weight: 700; font-size: 0.75rem; margin-right: 0.4rem; color: #64748b; }

  /* CUSTOM QUIZ CONFIG */
  .config-section { margin-bottom: 1.5rem; }
  .config-section h3 { font-size: 0.95rem; color: #94a3b8; margin-bottom: 0.75rem; }
  .config-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; }
  .unit-check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 600px) { .unit-check-grid { grid-template-columns: 1fr; } }
  .unit-check-group { display: flex; flex-direction: column; gap: 0.25rem; }
  .unit-check-header { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; margin-bottom: 0.4rem; }
  .unit-check { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.45rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; color: #94a3b8; }
  .unit-check:hover { background: #1e3a5f; color: #cbd5e1; }
  .unit-check input { accent-color: #3b82f6; }
  .num-btns { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .num-btn { width: 44px; height: 44px; border-radius: 8px; border: 1px solid #1e3a5f; background: #0d1a2e; color: #94a3b8; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 700; transition: all 0.12s; }
  .num-btn:hover { border-color: #3b82f6; color: #60a5fa; }
  .num-btn.active { background: #1d4ed8; border-color: #3b82f6; color: white; }
  .diff-toggles { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .diff-toggle { padding: 0.4rem 0.9rem; border-radius: 20px; border: 2px solid transparent; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 700; text-transform: capitalize; opacity: 0.4; transition: all 0.15s; }
  .diff-toggle.active { opacity: 1; }
  .diff-toggle.diff-easy { background: #052e16; color: #4ade80; border-color: #166534; }
  .diff-toggle.diff-medium { background: #422006; color: #fbbf24; border-color: #92400e; }
  .diff-toggle.diff-hard { background: #450a0a; color: #f87171; border-color: #991b1b; }
  .time-input-wrap { display: flex; align-items: center; gap: 0.6rem; }
  .time-input { width: 72px; background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 6px; padding: 0.45rem; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 1rem; text-align: center; outline: none; }
  .time-input:focus { border-color: #3b82f6; }
  .btn-start-quiz { background: linear-gradient(135deg,#1d4ed8,#7c3aed); border: none; border-radius: 10px; padding: 0.8rem 2.5rem; color: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; box-shadow: 0 0 20px rgba(99,102,241,0.3); transition: opacity 0.15s; }
  .btn-start-quiz:hover { opacity: 0.88; }

  /* PROGRESS */
  .visited-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem; }
  .visited-chip { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; padding: 0.4rem 0.6rem; border-radius: 8px; background: #0d1a2e; border: 1px solid #1e3a5f; cursor: pointer; min-width: 52px; transition: all 0.12s; }
  .visited-chip:hover { border-color: #3b82f6; }
  .visited-chip.visited { background: #0a2040; border-color: #1d4ed8; }
  .visited-id { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #94a3b8; }
  .visited-chip.visited .visited-id { color: #60a5fa; }
  .visited-count { font-size: 0.65rem; color: #3b82f6; }
  .tracker-empty { text-align: center; padding: 3rem 2rem; }
  .tracker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.8rem; }
  .tracker-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 10px; padding: 0.85rem 1rem; }
  .tracker-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.55rem; }
  .tracker-topic { font-weight: 600; font-size: 0.88rem; color: #cbd5e1; }
  .tracker-unit { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: #3b82f6; background: #0a1628; padding: 2px 6px; border-radius: 4px; }
  .tracker-bar-wrap { height: 5px; background: #1e3a5f; border-radius: 3px; margin-bottom: 0.35rem; overflow: hidden; }
  .tracker-bar { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
  .tracker-stats { font-size: 0.82rem; font-weight: 700; }

  /* HISTORY */
  .log-list { display: flex; flex-direction: column; gap: 0.7rem; }
  .log-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 10px; padding: 0.85rem 1rem; display: flex; gap: 1rem; cursor: pointer; transition: border-color 0.12s; }
  .log-card:hover { border-color: #3b82f6; }
  .log-card-left { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 54px; }
  .log-score { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; line-height: 1; }
  .log-bar-wrap { height: 4px; width: 100%; background: #1e3a5f; border-radius: 2px; margin-top: 4px; overflow: hidden; }
  .log-bar { height: 100%; border-radius: 2px; }
  .log-card-mid { flex: 1; }
  .log-type { font-weight: 700; font-size: 0.88rem; color: #cbd5e1; }
  .log-meta { font-size: 0.78rem; color: #64748b; margin: 0.2rem 0 0.35rem; }
  .log-topics { display: flex; flex-wrap: wrap; gap: 0.25rem; }
  .log-unit-chip { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 4px; padding: 1px 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: #3b82f6; }
  .log-card-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; }
  .log-date { font-size: 0.78rem; color: #64748b; }
  .log-view-btn { font-size: 0.78rem; color: #3b82f6; }
  .log-detail { display: flex; flex-direction: column; gap: 1rem; }
  .log-detail-header { display: flex; justify-content: space-between; align-items: flex-start; background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 12px; padding: 1rem 1.25rem; }
  .log-detail-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 900; color: #e2e8f0; }
  .log-detail-meta { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }
  .log-detail-score { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 900; }
  .log-questions { display: flex; flex-direction: column; gap: 0.7rem; }
  .log-question-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 10px; padding: 0.85rem 1rem; }
  .log-q-header { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; }
  .log-q-num { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #64748b; }
  .log-q-text { font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; color: #e2e8f0; margin-bottom: 0.65rem; line-height: 1.4; }
  .log-q-answers { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.82rem; }

  /* FLOATING CHAT */
  .chat-fab { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 500; width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg,#1d4ed8,#7c3aed); border: none; color: white; font-size: 1.4rem; cursor: pointer; box-shadow: 0 4px 20px rgba(99,102,241,0.5); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; }
  .chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(99,102,241,0.6); }
  .chat-fab-badge { position: absolute; top: -4px; right: -4px; background: #4ade80; color: #052e16; font-size: 0.6rem; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .chat-panel { position: fixed; bottom: 4.5rem; right: 1.5rem; z-index: 499; width: 380px; max-width: calc(100vw - 2rem); height: 500px; max-height: calc(100vh - 6rem); background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; }
  .chat-panel-header { display: flex; align-items: center; gap: 0.7rem; padding: 0.85rem 1rem; border-bottom: 1px solid #1e3a5f; flex-shrink: 0; }
  .chat-avatar-sm { width: 32px; height: 32px; background: linear-gradient(135deg,#1d4ed8,#7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: serif; font-size: 1rem; color: white; flex-shrink: 0; }
  .chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.6rem; padding: 0.9rem; }
  .chat-msg { display: flex; }
  .chat-msg.user { justify-content: flex-end; }
  .chat-msg.assistant { justify-content: flex-start; }
  .msg-bubble { max-width: 85%; padding: 0.6rem 0.85rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.55; white-space: pre-wrap; }
  .chat-msg.user .msg-bubble { background: #1d4ed8; color: #e0efff; border-bottom-right-radius: 3px; }
  .chat-msg.assistant .msg-bubble { background: #0a1628; border: 1px solid #1e3a5f; color: #cbd5e1; border-bottom-left-radius: 3px; }
  .typing { display: flex; align-items: center; gap: 5px; padding: 0.8rem 0.85rem !important; }
  .typing span { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: bounce 1.2s infinite; }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,80%,100% { transform: scale(1); opacity: 0.5; } 40% { transform: scale(1.4); opacity: 1; } }
  .chat-input-area { padding: 0.75rem; border-top: 1px solid #1e3a5f; flex-shrink: 0; }
  .chat-input { width: 100%; background: #0a1628; border: 1px solid #1e3a5f; border-radius: 8px; padding: 0.55rem 0.75rem; color: #e2e8f0; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; resize: none; outline: none; margin-bottom: 0.5rem; }
  .chat-input:focus { border-color: #3b82f6; }
  .chat-input-actions { display: flex; justify-content: space-between; align-items: center; }

  /* CALC KEYBOARD */
  .calc-keyboard { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 10px; padding: 0.75rem; margin-top: 0.5rem; }
  .calc-keyboard-title { font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem; }
  .calc-row { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.25rem; }
  .calc-key { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 5px; padding: 0.3rem 0.5rem; color: #c4b5fd; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; transition: all 0.1s; min-width: 32px; text-align: center; }
  .calc-key:hover { background: #1e3a5f; border-color: #3b82f6; color: #60a5fa; }

  /* BUTTONS */
  .btn-primary { background: #1d4ed8; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; color: white; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; transition: background 0.12s; }
  .btn-primary:hover { background: #2563eb; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 7px; padding: 0.5rem 1.1rem; color: #94a3b8; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; transition: all 0.12s; }
  .btn-secondary:hover { border-color: #3b82f6; color: #60a5fa; }
  .btn-ghost { background: none; border: none; color: #64748b; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; transition: color 0.12s; padding: 0.25rem 0.5rem; }
  .btn-ghost:hover { color: #94a3b8; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080f1e; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #2563eb; }

  /* LIGHT THEME OVERRIDES */
  .theme-light { background: var(--bg) !important; color: var(--text) !important; }
  .theme-light .app-header { background: var(--bg2) !important; border-color: var(--border) !important; }
  .theme-light .app-title { color: var(--text) !important; }
  .theme-light .sidebar { background: var(--bg3) !important; border-color: var(--border) !important; }
  .theme-light .side-nav-btn { color: var(--text2) !important; }
  .theme-light .side-nav-btn:hover, .theme-light .side-nav-active { background: var(--border) !important; color: var(--accent) !important; }
  .theme-light .notes-card, .theme-light .home-card, .theme-light .tracker-card, .theme-light .log-card, .theme-light .settings-card { background: var(--bg2) !important; border-color: var(--border) !important; }
  .theme-light .concept-item, .theme-light .formula-item { background: var(--bg3) !important; color: var(--text) !important; }
  .theme-light .formula-item { color: #5b21b6 !important; }
  .theme-light .notes-title, .theme-light .home-greeting { color: var(--text) !important; }
  .theme-light .card-title, .theme-light .home-card-title { color: var(--accent) !important; }
  .theme-light .quiz-question { background: var(--bg2) !important; border-color: var(--border) !important; color: var(--text) !important; }
  .theme-light .quiz-input { background: var(--bg3) !important; border-color: var(--border) !important; color: var(--text) !important; }
  .theme-light .msg-bubble { }
  .theme-light .chat-msg.assistant .msg-bubble { background: var(--bg2) !important; border-color: var(--border) !important; color: var(--text) !important; }
  .theme-light .chat-panel { background: var(--bg2) !important; border-color: var(--border) !important; }
  .theme-light .chat-input { background: var(--bg3) !important; border-color: var(--border) !important; color: var(--text) !important; }
  .theme-light .stat-card { background: var(--bg2) !important; border-color: var(--border) !important; }
  .theme-light .stat-number { color: var(--accent) !important; }
  .theme-light .stat-label { color: var(--text3) !important; }
  .theme-light .visited-chip { background: var(--bg2) !important; border-color: var(--border) !important; }
  .theme-light .visited-chip.visited { background: #dbeafe !important; border-color: #93c5fd !important; }
  .theme-light .main-content { background: var(--bg) !important; }
  .theme-light .app-body { background: var(--bg) !important; }
  .theme-light .unit-btn { color: var(--text2) !important; }
  .theme-light .unit-btn:hover, .theme-light .unit-active { background: var(--border) !important; color: var(--accent) !important; }
  .theme-light .test-btn { border-color: var(--border) !important; color: var(--text2) !important; }
  .theme-light .test-btn.active { background: var(--accent) !important; color: white !important; }
  .theme-light .btn-secondary { background: var(--bg2) !important; border-color: var(--border) !important; color: var(--text2) !important; }
  .theme-light .btn-ghost { color: var(--text3) !important; }
  .theme-light .tracker-bar-wrap, .theme-light .coverage-bar-wrap { background: var(--border) !important; }
  .theme-light .quick-action-btn { background: var(--bg2) !important; border-color: var(--border) !important; color: var(--text2) !important; }
  .theme-light .quick-action-btn:hover { background: var(--border) !important; color: var(--text) !important; }

  /* FONT SIZES */
  .font-small { font-size: 13px; }
  .font-medium { font-size: 15px; }
  .font-large { font-size: 17px; }

  /* LAYOUT FIX — ensure full width fill */
  .app-body { width: 100%; }
  .main-content { flex: 1 1 0; min-width: 0; width: 0; }

  /* AUTH BACK BUTTON */
  .auth-back-btn { background: none; border: none; color: #64748b; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; padding: 0; margin-bottom: 0.5rem;
    transition: color 0.15s; text-align: left; }
  .auth-back-btn:hover { color: #94a3b8; }

  /* SETTINGS */
  .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }

  /* WORKED EXAMPLES */
  .examples-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem; }
  .example-card { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 8px; padding: 0.9rem; }
  .example-title { font-weight: 700; font-size: 0.88rem; color: #f59e0b; margin-bottom: 0.6rem; }
  .example-steps { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; padding: 0; }
  .example-step { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #cbd5e1; padding: 0.3rem 0.5rem; background: #080f1e; border-radius: 4px; border-left: 2px solid #f59e0b; counter-increment: step; }
  .example-step::before { content: counter(step) ". "; color: #f59e0b; font-weight: 700; }
  .example-steps { counter-reset: step; }

  /* PRINT / CHEAT SHEET */
  @media print {
    .app-header, .sidebar, .chat-fab, .chat-panel { display: none !important; }
    .main-content { overflow: visible !important; }
    body, .app { background: white !important; color: black !important; }
    .cs-unit { background: white !important; border-color: #ccc !important; page-break-inside: avoid; }
  }
  .settings-card { background: #0d1a2e; border: 1px solid #1e3a5f; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.9rem; }
  .settings-card-title { font-size: 0.9rem; font-weight: 700; color: #60a5fa; padding-bottom: 0.5rem; border-bottom: 1px solid #1e3a5f; }
  .settings-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .settings-label { font-size: 0.88rem; font-weight: 600; color: #cbd5e1; }
  .settings-desc { font-size: 0.78rem; color: #64748b; margin-top: 0.15rem; }
  .theme-toggle-row { display: flex; gap: 0.4rem; flex-shrink: 0; }
  .theme-btn { padding: 0.35rem 0.75rem; border-radius: 8px; border: 1px solid #1e3a5f; background: #0a1628;
    color: #64748b; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600; transition: all 0.15s; }
  .theme-btn:hover { border-color: #3b82f6; color: #e2e8f0; }
  .theme-btn-active { background: #1d4ed8 !important; border-color: #3b82f6 !important; color: white !important; }
  .settings-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid #1e3a5f; font-size: 0.85rem; color: #94a3b8; }
  .settings-stat-row strong { color: #e2e8f0; }
  .settings-signout-btn { background: #0a1628; border: 1px solid #1e3a5f; border-radius: 8px; padding: 0.5rem 1rem;
    color: #94a3b8; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600;
    transition: all 0.15s; text-align: left; }
  .settings-signout-btn:hover { border-color: #f87171; color: #f87171; }
  .settings-danger-btn { background: #450a0a; border: 1px solid #991b1b; border-radius: 8px; padding: 0.5rem 1rem;
    color: #f87171; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
    transition: all 0.15s; }
  .settings-danger-btn:hover { background: #7f1d1d; }
`;

