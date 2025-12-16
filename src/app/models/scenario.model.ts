export interface ScenarioConfig {
  id: string;
  name: string;
  infoText: string;
}

// TODO(enERSyn): Replace infoText placeholders with final descriptions from team
export const SCENARIOS: ScenarioConfig[] = [
  {
    id: '1',
    name: 'Batterie-Lkw',
    infoText: '[TBD - Text kommt noch vom Team]'
  },
  {
    id: '2',
    name: 'Batterie-Lkw ohne Verzögerung',
    infoText: '[TBD - Text kommt noch vom Team]'
  },
  {
    id: '3',
    name: 'Batterie-Lkw mit Ladeinfrastruktur-Restriktion',
    infoText: '[TBD - Text kommt noch vom Team]'
  },
  {
    id: '4',
    name: 'Mit Batteriewechsel-Lkw',
    infoText: '[TBD - Text kommt noch vom Team]'
  },
  {
    id: '5',
    name: 'Mit Batteriewechsel-Lkw und Batterie-Lkw mit max. 1000 km Reichweite',
    infoText: '[TBD - Text kommt noch vom Team]'
  },
  {
    id: '6',
    name: 'Mit Oberleitungs-Lkw',
    infoText: '[TBD - Text kommt noch vom Team]'
  },
  {
    id: '7',
    name: 'Mit Brennstoffzellen-Lkw',
    infoText: '[TBD - Text kommt noch vom Team]'
  },
  {
    id: '8',
    name: 'Mit Brennstoffzellen-Lkw und H2-Mix',
    infoText: '[TBD - Text kommt noch vom Team]'
  }
];
