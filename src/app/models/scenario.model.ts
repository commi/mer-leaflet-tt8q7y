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
    infoText: '[Text kommt noch]'
  },
  {
    id: '2',
    name: 'Batterie-Lkw ohne Verzögerung',
    infoText: '[Text kommt noch]'
  },
  {
    id: '3',
    name: 'Batterie-Lkw mit Ladeinfrastruktur-Restriktion',
    infoText: '[Text kommt noch]'
  },
  {
    id: '4',
    name: 'Mit Batteriewechsel-Lkw',
    infoText: '[Text kommt noch]'
  },
  {
    id: '5',
    name: 'Mit Batteriewechsel-Lkw und Batterie-Lkw mit max. 1000 km Reichweite',
    infoText: '[Text kommt noch]'
  },
  {
    id: '6',
    name: 'Mit Oberleitungs-Lkw',
    infoText: '[Text kommt noch]'
  },
  {
    id: '7',
    name: 'Mit Brennstoffzellen-Lkw',
    infoText: '[Text kommt noch]'
  },
  {
    id: '8',
    name: 'Mit Brennstoffzellen-Lkw und H2-Mix',
    infoText: '[Text kommt noch]'
  }
];
