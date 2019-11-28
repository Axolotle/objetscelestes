// temp name converter for Bayer designation
// https://en.wikibooks.org/wiki/Celestia/STC_File#Bayer_Star_Names
// https://fr.wikipedia.org/wiki/Alphabet_grec
const greekAbbr = {
    'alf': 'α', 'bet': 'β', 'gam': 'γ', 'del': 'δ',
    'eps': 'ε', 'zet': 'ζ', 'eta': 'η', 'tet': 'θ',
    'iot': 'ι', 'kap': 'κ', 'lam': 'λ', 'mu.': 'μ',
    'nu.': 'ν', 'ksi': 'ξ', 'omi': 'ο', 'pi.': 'π',
    'rho': 'ρ', 'sig': 'σ', 'tau': 'τ', 'ups': 'υ',
    'phi': 'φ', 'chi': 'χ', 'psi': 'ψ', 'ome': 'ω',
}

const constName = {
    'UMa': 'Grande Ourse (Ursa Major)'
}

const starType = {
    'Star': 'Star',
    'PM*': 'High proper-motion Star',
    'SB*': 'Spectroscopic binary',
    'Em*': 'Emission-line Star',
    '**': 'Double or multiple star',
    'RSCVn': 'Variable Star of RS CVn type',
    'PulsV*delSct': 'Variable Star of delta Sct type',
    'RotV*alf2CVn': 'Variable Star of alpha2 CVn type',
}


export { greekAbbr, constName, starType };
