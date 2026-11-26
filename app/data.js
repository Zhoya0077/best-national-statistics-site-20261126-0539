// Aurelia National Statistics Office — published figures, 2015–2025.
// All figures are the Office's own published estimates for the fictional
// Republic of Aurelia. Currency: the aurel (AUR). Population in persons,
// GDP in billion AUR at current prices unless stated otherwise.
'use strict';

const ANSO = {
  country: 'Republic of Aurelia',
  office: 'Aurelia National Statistics Office',
  short: 'ANSO',
  capital: 'Port Meridian',
  currency: 'aurel (AUR)',
  years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],

  // National yearly series (index matches ANSO.years).
  series: {
    population:      [3912000, 3954000, 3998000, 4041000, 4085000, 4119000, 4152000, 4190000, 4231000, 4272000, 4284000],
    gdp:             [61.2, 63.8, 66.9, 70.4, 73.9, 71.2, 76.8, 83.1, 88.7, 93.0, 96.4],
    gdpGrowth:       [3.1, 4.2, 4.9, 5.2, 5.0, -3.6, 7.9, 8.2, 6.7, 4.8, 3.7],
    gdpPerCapita:    [15644, 16137, 16733, 17422, 18091, 17286, 18497, 19833, 20964, 21770, 22502],
    unemployment:    [7.4, 7.1, 6.8, 6.4, 6.1, 8.9, 7.8, 6.9, 6.2, 5.8, 5.5],
    inflation:       [1.8, 1.4, 2.1, 2.6, 2.2, 0.9, 3.4, 6.1, 4.8, 3.2, 2.7],
    lifeExpectancy:  [78.2, 78.4, 78.6, 78.9, 79.1, 78.7, 79.0, 79.4, 79.7, 80.0, 80.2],
    literacy:        [96.8, 97.0, 97.1, 97.3, 97.5, 97.6, 97.7, 97.9, 98.0, 98.1, 98.2],
    enrolmentPrimary: [98.4, 98.5, 98.6, 98.7, 98.8, 98.1, 98.6, 98.9, 99.0, 99.1, 99.2],
    enrolmentSecondary: [91.2, 91.8, 92.4, 93.0, 93.6, 92.9, 93.8, 94.5, 95.1, 95.6, 96.0],
    enrolmentTertiary: [52.1, 53.4, 54.8, 56.2, 57.9, 58.6, 60.1, 61.7, 63.2, 64.8, 66.1],
    hospitalBeds:    [3.42, 3.45, 3.48, 3.51, 3.55, 3.61, 3.66, 3.70, 3.74, 3.78, 3.82],
    doctorsPer10k:   [24.1, 24.6, 25.2, 25.8, 26.4, 27.0, 27.8, 28.5, 29.2, 29.9, 30.6],
    exports:         [18.4, 19.1, 20.3, 21.8, 22.9, 20.6, 23.4, 26.2, 28.1, 29.6, 31.0],
    imports:         [17.9, 18.6, 19.8, 21.2, 22.4, 20.1, 22.8, 25.4, 27.0, 28.3, 29.4],
    internetUsers:   [71.2, 74.6, 77.8, 80.9, 83.4, 86.1, 88.7, 90.4, 91.8, 93.0, 94.1],
    renewableShare:  [28.4, 30.1, 31.8, 33.6, 35.2, 37.0, 39.4, 41.8, 44.1, 46.3, 48.7]
  },

  // Age structure, 2025 (share of population, %).
  ageGroups2025: [
    { group: '0–14', share: 17.8 },
    { group: '15–24', share: 12.4 },
    { group: '25–54', share: 41.6 },
    { group: '55–64', share: 13.1 },
    { group: '65+', share: 15.1 }
  ],

  // GDP by sector, 2025 (share of GDP, %).
  sectors2025: [
    { sector: 'Services', share: 61.4 },
    { sector: 'Industry', share: 24.8 },
    { sector: 'Agriculture & fishing', share: 8.6 },
    { sector: 'Construction', share: 5.2 }
  ],

  // Employment by sector, 2025 (share of employment, %).
  jobs2025: [
    { sector: 'Services', share: 68.9 },
    { sector: 'Industry', share: 17.3 },
    { sector: 'Agriculture & fishing', share: 9.4 },
    { sector: 'Construction', share: 4.4 }
  ],

  // Six provinces, 2025 figures.
  regions: [
    { id: 'meridia', name: 'Meridia', capital: 'Port Meridian', population: 1284000, area: 4820, gdpPerCapita: 31240, unemployment: 4.6, density: 266, coastline: 'Yes', note: 'Capital province; seat of government, the national port and the financial district.' },
    { id: 'northvale', name: 'Northvale', capital: 'Calder Falls', population: 742000, area: 12480, gdpPerCapita: 19870, unemployment: 5.9, density: 59, coastline: 'No', note: 'Highland province; hydro power, timber and winter tourism.' },
    { id: 'eastshore', name: 'Eastshore', capital: 'Harbourlight', population: 689000, area: 7310, gdpPerCapita: 22410, unemployment: 5.2, density: 94, coastline: 'Yes', note: 'Fishing fleets, canneries and the country\u2019s largest container terminal.' },
    { id: 'southridge', name: 'Southridge', capital: 'Vellamore', population: 521000, area: 9860, gdpPerCapita: 18320, unemployment: 6.4, density: 53, coastline: 'No', note: 'Vineyards, orchards and the southern grain belt.' },
    { id: 'westmoor', name: 'Westmoor', capital: 'Dunharrow', population: 468000, area: 15230, gdpPerCapita: 16980, unemployment: 6.8, density: 31, coastline: 'Yes', note: 'Wind farms, peatlands and the western ferry routes.' },
    { id: 'tern', name: 'Isles of Tern', capital: 'Ternmouth', population: 580000, area: 2140, gdpPerCapita: 24650, unemployment: 5.0, density: 271, coastline: 'Yes', note: 'Island province; tourism, shipbuilding and marine research.' }
  ],

  // Causes of death, 2025 (share of all deaths, %).
  causesOfDeath2025: [
    { cause: 'Heart disease', share: 24.6 },
    { cause: 'Cancer', share: 22.8 },
    { cause: 'Respiratory disease', share: 9.7 },
    { cause: 'Stroke', share: 7.9 },
    { cause: 'Accidents', share: 5.4 },
    { cause: 'Diabetes', share: 3.8 },
    { cause: 'Other', share: 25.8 }
  ],

  // Latest releases (fictional release calendar).
  releases: [
    { date: '2026-11-20', title: 'Labour Force Survey, Q3 2026', tag: 'Labour' },
    { date: '2026-11-13', title: 'Consumer Price Index, October 2026', tag: 'Prices' },
    { date: '2026-11-06', title: 'Regional GDP estimates, 2025', tag: 'Economy' },
    { date: '2026-10-30', title: 'Population estimates, mid-2026', tag: 'Population' },
    { date: '2026-10-23', title: 'Education enrolment, school year 2026/27', tag: 'Education' },
    { date: '2026-10-16', title: 'Health survey: hospitals and staffing, 2025', tag: 'Health' }
  ],

  indicators: [
    { key: 'population', label: 'Population', unit: 'persons', format: 'int' },
    { key: 'gdp', label: 'GDP (current prices)', unit: 'billion AUR', format: 'num1' },
    { key: 'gdpGrowth', label: 'Real GDP growth', unit: '% per year', format: 'num1' },
    { key: 'gdpPerCapita', label: 'GDP per capita', unit: 'AUR', format: 'int' },
    { key: 'unemployment', label: 'Unemployment rate', unit: '% of labour force', format: 'num1' },
    { key: 'inflation', label: 'Consumer price inflation', unit: '% per year', format: 'num1' },
    { key: 'lifeExpectancy', label: 'Life expectancy at birth', unit: 'years', format: 'num1' },
    { key: 'literacy', label: 'Adult literacy rate', unit: '%', format: 'num1' },
    { key: 'enrolmentPrimary', label: 'Primary enrolment (net)', unit: '%', format: 'num1' },
    { key: 'enrolmentSecondary', label: 'Secondary enrolment (net)', unit: '%', format: 'num1' },
    { key: 'enrolmentTertiary', label: 'Tertiary enrolment (gross)', unit: '%', format: 'num1' },
    { key: 'hospitalBeds', label: 'Hospital beds', unit: 'per 1,000 people', format: 'num2' },
    { key: 'doctorsPer10k', label: 'Doctors', unit: 'per 10,000 people', format: 'num1' },
    { key: 'exports', label: 'Exports of goods', unit: 'billion AUR', format: 'num1' },
    { key: 'imports', label: 'Imports of goods', unit: 'billion AUR', format: 'num1' },
    { key: 'internetUsers', label: 'Internet users', unit: '% of population', format: 'num1' },
    { key: 'renewableShare', label: 'Renewable electricity share', unit: '% of generation', format: 'num1' }
  ]
};
