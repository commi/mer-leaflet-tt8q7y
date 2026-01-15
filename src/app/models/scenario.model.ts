export interface ScenarioConfig {
  id: string;
  name: string;
  infoText: string;
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: '1',
    name: 'Batterie-Lkw',
    infoText: 'Dieses Szenario stellt das Ausgangsszenario dar. Die Antriebswende wird ausschließlich durch Batterie-Lkw vollzogen. Dabei wird ein bedarfsgerechter Ausbau privater und öffentlicher Ladeinfrastruktur angenommen. Verzögerungen durch Zwischenladen außerhalb der gesetzlichen Lenkzeitpausen werden mit Zeitkosten von 35 € pro zusätzlicher Stunde bepreist. Die maximale Batteriereichweite beträgt 700 km.'
  },
  {
    id: '2',
    name: 'Batterie-Lkw ohne Verzögerung',
    infoText: 'In diesem Szenario tragen Batterie-Lkw alleine zur Antriebswende bei. Verzögerungen im Betriebsablauf werden nicht toleriert, sodass Lkw neben dem Laden über Nacht im Depot ausschließlich in den gesetzlichen Lenkzeitpausen zwischenladen können.'
  },
  {
    id: '3',
    name: 'Batterie-Lkw mit Ladeinfrastruktur-Restriktion',
    infoText: 'In diesem Szenario tragen Batterie-Lkw alleine zur Antriebswende bei, allerdings können aufgrund von Infrastrukturrestriktionen nur ca. 75 % der Fahrzeuge mit öffentlichem Ladebedarf bedient werden. Der Hochlauf fällt entsprechend langsamer aus.'
  },
  {
    id: '4',
    name: 'Mit Batteriewechsel-Lkw',
    infoText: 'In diesem Szenario unterstützen Batteriewechsel-Lkw die Antriebswende, da sie den verzögerten Hochlauf von Batterie-Lkw durch Restriktionen bei der Ladeinfrastruktur relativ gut ausgleichen können. Hier werden Wechselzeiten von 10 Minuten pro Batterie angenommen. Die Anzahl der Rückhaltebatterien sinkt von 2 pro Lkw im Jahr 2025 auf 1,2 im Jahr 2045.'
  },
  {
    id: '5',
    name: 'Mit Batteriewechsel-Lkw und Batterie-Lkw mit max. 1000 km Reichweite',
    infoText: 'In diesem Szenario wird für die Batterie-Lkw eine Reichweite von bis zu 1000 km angenommen. Die Batteriewechsel-Lkw verlieren damit ihren Vorteil, die begrenzte Ladeinfrastruktur der Batterie-Lkw ausgleichen, da die entsprechenden Fahrten mit den größeren Batterien ohne zusätzlichen Ladebedarf bedient werden können.'
  },
  {
    id: '6',
    name: 'Mit Oberleitungs-Lkw',
    infoText: 'In diesem Szenario wird überprüft, ob Oberleitungs-Lkw mit einem Kernnetz von ca. 3.000 km den verzögerten Hochlauf von Batterie-Lkw aufgrund von Infrastrukturrestriktionen ausgleichen können. Die Ergebnisse zeigen allerdings nur ein sehr begrenztes Potential, was vor allem auf die begrenzte Netzausdehnung innerhalb Deutschlands zurückgeht.'
  },
  {
    id: '7',
    name: 'Mit Brennstoffzellen-Lkw',
    infoText: 'In diesem Szenario wird überprüft, ob Brennstoffzellen-Lkw den verzögerten Hochlauf von Batterie-Lkw aufgrund von Infrastrukturrestriktionen ausgleichen können. Unter der Annahme ausreichender H₂-Tankinfrastruktur ist dies zum größten Teil möglich. Es wird eine Betankung mit 100 % grünem Wasserstoff angenommen.'
  },
  {
    id: '8',
    name: 'Mit Brennstoffzellen-Lkw und H₂-Mix',
    infoText: 'Dieses Szenario entspricht dem Szenario "Mit Brennstoffzellen-Lkw", allerdings mit einem Wasserstoff-Mix gemäß Projektionsbericht 2025 anstatt ausschließlich grünem H₂.'
  }
];
