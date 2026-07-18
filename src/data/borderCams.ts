export interface BorderCamStream {
  id: string;
  title: string;
  url: string;
  tall?: boolean;
}

export interface BorderCamGroup {
  id: string;
  code: string;
  label: string;
  streams: BorderCamStream[];
}

const MUP = 'https://kamere.mup.gov.rs:4443';

export const BORDER_CAM_GROUPS: BorderCamGroup[] = [
  {
    id: 'nmk',
    code: 'NMK',
    label: 'North Macedonia',
    streams: [
      {
        id: 'presevo-in',
        title: 'Preševo — entry',
        url: `${MUP}/Presevo/presevo1.m3u8`,
      },
      {
        id: 'presevo-out',
        title: 'Preševo — exit',
        url: `${MUP}/Presevo/presevo2.m3u8`,
      },
    ],
  },
  {
    id: 'nmk-gre',
    code: 'NMK → GRE',
    label: 'North Macedonia → Greece',
    streams: [
      {
        id: 'bogorodica',
        title: 'Bogorodica',
        url: 'https://streaming1.neotel.net.mk/stream/bogorodica.m3u8',
        tall: true,
      },
    ],
  },
  {
    id: 'bg',
    code: 'BG',
    label: 'Bulgaria',
    streams: [
      {
        id: 'gradina-in',
        title: 'Gradina — entry',
        url: `${MUP}/Gradina/gradina1.m3u8`,
      },
      {
        id: 'gradina-out',
        title: 'Gradina — exit',
        url: `${MUP}/Gradina/gradina2.m3u8`,
      },
    ],
  },
  {
    id: 'hr',
    code: 'HR',
    label: 'Croatia',
    streams: [
      {
        id: 'batrovci-in',
        title: 'Batrovci — entry',
        url: `${MUP}/Batrovci/batrovci1.m3u8`,
      },
      {
        id: 'batrovci-out',
        title: 'Batrovci — exit',
        url: `${MUP}/Batrovci/batrovci2.m3u8`,
      },
    ],
  },
  {
    id: 'hun',
    code: 'HUN',
    label: 'Hungary',
    streams: [
      {
        id: 'horgos-in',
        title: 'Horgoš — entry',
        url: `${MUP}/Horgos/horgos1.m3u8`,
      },
      {
        id: 'horgos-out',
        title: 'Horgoš — exit',
        url: `${MUP}/Horgos/horgos2.m3u8`,
      },
    ],
  },
  {
    id: 'mne',
    code: 'MNE',
    label: 'Montenegro',
    streams: [
      {
        id: 'spiljani-in',
        title: 'Špiljani — entry',
        url: `${MUP}/Spiljani/spiljani1.m3u8`,
      },
      {
        id: 'spiljani-out',
        title: 'Špiljani — exit',
        url: `${MUP}/Spiljani/spiljani2.m3u8`,
      },
    ],
  },
];
