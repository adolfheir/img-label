import { pick } from 'lodash';

export const mockImg = new URL(`./1528905923890782208.png`, import.meta.url).href;

export let mockRectList1 = [
  {
    algorithmVersion: 4,
    rect: {
      topleft: {
        x: 0.7734375,
        y: 0.08203125,
      },
      width: 0.0807291641831398,
      height: 0.076171875,
    },
    objectId: 0,
    confidence: 0.99853515625,
    feature: '',
    qualityScore: 0.448486328125,
    faceCorrectImage: '',
    norm: 0,
    pedestrianPropertysList: [],
    extendRect: {
      topleft: {
        x: 0.7526041865348816,
        y: 0.05859375,
      },
      width: 0.1223958358168602,
      height: 0.123046875,
    },
    featureId: '1673516133661036544',
    r1: 2.7250914573669434,
    r2: 0.7439883947372437,
  },
  {
    algorithmVersion: 7,
    rect: {
      topleft: {
        x: 0.6614583134651184,
        y: 0.029296875,
      },
      width: 0.3255208432674408,
      height: 0.33984375,
    },
    objectId: 0,
    confidence: 0.48876452445983887,
    feature: '',
    qualityScore: 0,
    faceCorrectImage: '',
    norm: 2.03125,
    pedestrianPropertysList: [
      0.0531005859375, 0.033843994140625, 0.97119140625, 0.04046630859375, 0.169921875, 0.0706787109375, 0.5029296875,
      0.1519775390625, 0.342529296875, 0.06646728515625, 0.27734375, 0.1505126953125, 0.1951904296875, 0.08135986328125,
      0.06842041015625, 0.8447265625, 0.91650390625, 0.1973876953125, 0.073974609375, 0.041839599609375,
      0.058990478515625, 0.196044921875, 0.0703125, 0.11859130859375, 0.1607666015625, 0.384765625, 0.13623046875,
      0.21728515625, 0.861328125, 0.038818359375, 0.0638427734375, 0.0386962890625, 0.39111328125, 0.0211639404296875,
      0.053985595703125, 0.08831787109375, 0.10614013671875, 0.053314208984375, 0.39404296875, 0.05987548828125,
      0.1954345703125, 0.11456298828125, 0.05560302734375, 0.06439208984375, 0.0975341796875, 0.0394287109375,
      0.24853515625, 0.044586181640625, 0.9468994140625, 0.830078125, 0.9293212890625, 0.4970703125, 0.72265625,
    ],
    extendRect: {
      topleft: {
        x: 0.5625,
        y: 0,
      },
      width: 0.4375,
      height: 0.455078125,
    },
    featureId: '1673516133661036545',
    r1: 0,
    r2: 0,
  },
  {
    algorithmVersion: 4,
    rect: {
      topleft: {
        x: 0.4947916567325592,
        y: 0.189453125,
      },
      width: 0.0833333358168602,
      height: 0.080078125,
    },
    objectId: 1,
    confidence: 0.99560546875,
    feature: '',
    qualityScore: 0.45556640625,
    faceCorrectImage: '',
    norm: 0,
    pedestrianPropertysList: [],
    extendRect: {
      topleft: {
        x: 0.4739583432674408,
        y: 0.166015625,
      },
      width: 0.125,
      height: 0.125,
    },
    featureId: '1673516133661036546',
    r1: 2.5240235328674316,
    r2: 1.0198910236358643,
  },
  {
    algorithmVersion: 7,
    rect: {
      topleft: {
        x: 0.3203125,
        y: 0.1484375,
      },
      width: 0.328125,
      height: 0.673828125,
    },
    objectId: 1,
    confidence: 0.7872088551521301,
    feature: '',
    qualityScore: 0,
    faceCorrectImage: '',
    norm: 1.669921875,
    pedestrianPropertysList: [
      0.912109375, 0.0574951171875, 0.93603515625, 0.093017578125, 0.1961669921875, 0.93798828125, 0.720703125,
      0.184326171875, 0.791015625, 0.1566162109375, 0.9072265625, 0.5537109375, 0.10894775390625, 0.1766357421875,
      0.375732421875, 0.51416015625, 0.53759765625, 0.60888671875, 0.251708984375, 0.1390380859375, 0.06439208984375,
      0.326416015625, 0.06842041015625, 0.89599609375, 0.11474609375, 0.072265625, 0.120361328125, 0.153076171875,
      0.130615234375, 0.062103271484375, 0.0948486328125, 0.2391357421875, 0.9189453125, 0.1297607421875,
      0.1680908203125, 0.10992431640625, 0.07183837890625, 0.09637451171875, 0.91796875, 0.09844970703125, 0.044921875,
      0.04949951171875, 0.091552734375, 0.08880615234375, 0.083740234375, 0.053192138671875, 0.1044921875, 0.265625,
      0.087890625, 0.8038330078125, 0.06201171875, 0.279296875, 0.0927734375,
    ],
    extendRect: {
      topleft: {
        x: 0,
        y: 0,
      },
      width: 0.9895833134651184,
      height: 0.990234375,
    },
    featureId: '1673516133661036547',
    r1: 0,
    r2: 0,
  },
  {
    algorithmVersion: 4,
    rect: {
      topleft: {
        x: 0.7552083134651184,
        y: 0.275390625,
      },
      width: 0.078125,
      height: 0.083984375,
    },
    objectId: 2,
    confidence: 0.9580078125,
    feature: '',
    qualityScore: 0.439697265625,
    faceCorrectImage: '',
    norm: 0,
    pedestrianPropertysList: [],
    extendRect: {
      topleft: {
        x: 0.7291666865348816,
        y: 0.25390625,
      },
      width: 0.1276041716337204,
      height: 0.126953125,
    },
    featureId: '1673516133661036548',
    r1: 1.3535540103912354,
    r2: 1.0727794170379639,
  },
  {
    algorithmVersion: 7,
    rect: {
      topleft: {
        x: 0.5494791865348816,
        y: 0.21875,
      },
      width: 0.3098958432674408,
      height: 0.78125,
    },
    objectId: 2,
    confidence: 0.8815636038780212,
    feature: '',
    qualityScore: 0,
    faceCorrectImage: '',
    norm: 1.798828125,
    pedestrianPropertysList: [
      0.0190887451171875, 0.036346435546875, 0.9423828125, 0.07904052734375, 0.344482421875, 0.0264129638671875,
      0.10321044921875, 0.1759033203125, 0.90771484375, 0.012237548828125, 0.97412109375, 0.335693359375, 0.4482421875,
      0.23974609375, 0.2188720703125, 0.472900390625, 0.90966796875, 0.262451171875, 0.02447509765625,
      0.0164031982421875, 0.042877197265625, 0.0703125, 0.04620361328125, 0.0364990234375, 0.028656005859375,
      0.04302978515625, 0.341064453125, 0.82421875, 0.0247955322265625, 0.02288818359375, 0.062225341796875,
      0.0235595703125, 0.97900390625, 0.50537109375, 0.0850830078125, 0.0201416015625, 0.01934814453125,
      0.0482177734375, 0.92919921875, 0.11676025390625, 0.09027099609375, 0.0225372314453125, 0.0300445556640625,
      0.0592041015625, 0.0322265625, 0.01751708984375, 0.046722412109375, 0.07208251953125, 0.9809112548828125,
      0.655517578125, 0.9735870361328125, 0.89678955078125, 0.02587890625,
    ],
    extendRect: {
      topleft: {
        x: 0.2161458283662796,
        y: 0.0234375,
      },
      width: 0.7838541865348816,
      height: 0.9765625,
    },
    featureId: '1673516133661036549',
    r1: 0,
    r2: 0,
  },
  {
    algorithmVersion: 4,
    rect: {
      topleft: {
        x: 0.8567708134651184,
        y: 0.244140625,
      },
      width: 0.0859375,
      height: 0.0859375,
    },
    objectId: 3,
    confidence: 0.9970703125,
    feature: '',
    qualityScore: 0.5263671875,
    faceCorrectImage: '',
    norm: 0,
    pedestrianPropertysList: [],
    extendRect: {
      topleft: {
        x: 0.8333333134651184,
        y: 0.22265625,
      },
      width: 0.1302083283662796,
      height: 0.12890625,
    },
    featureId: '1673516133661036550',
    r1: 2.411208152770996,
    r2: 0.842319130897522,
  },
  {
    algorithmVersion: 7,
    rect: {
      topleft: {
        x: 0.7916666865348816,
        y: 0.23046875,
      },
      width: 0.2057291716337204,
      height: 0.728515625,
    },
    objectId: 3,
    confidence: 0.8219853043556213,
    feature: '',
    qualityScore: 0,
    faceCorrectImage: '',
    norm: 1.8583984375,
    pedestrianPropertysList: [
      0.9521484375, 0.023193359375, 0.97998046875, 0.03302001953125, 0.082275390625, 0.87255859375, 0.2509765625,
      0.0411376953125, 0.9140625, 0.1416015625, 0.97900390625, 0.2451171875, 0.06719970703125, 0.2437744140625,
      0.353759765625, 0.65283203125, 0.91552734375, 0.10174560546875, 0.07904052734375, 0.05718994140625,
      0.10052490234375, 0.08978271484375, 0.88037109375, 0.05877685546875, 0.026702880859375, 0.07989501953125,
      0.03753662109375, 0.148193359375, 0.06732177734375, 0.1131591796875, 0.144775390625, 0.042388916015625,
      0.94091796875, 0.04083251953125, 0.0439453125, 0.08251953125, 0.06268310546875, 0.089111328125, 0.80712890625,
      0.042633056640625, 0.2247314453125, 0.051177978515625, 0.056640625, 0.0755615234375, 0.04052734375,
      0.030731201171875, 0.11260986328125, 0.09332275390625, 0.0478515625, 0.917724609375, 0.12744140625, 0.7490234375,
      0.02099609375,
    ],
    extendRect: {
      topleft: {
        x: 0.3932291567325592,
        y: 0.048828125,
      },
      width: 0.6067708134651184,
      height: 0.951171875,
    },
    featureId: '1673516133661036551',
    r1: 0,
    r2: 0,
  },
  {
    algorithmVersion: 4,
    rect: {
      topleft: {
        x: 0.140625,
        y: 0.328125,
      },
      width: 0.0989583358168602,
      height: 0.07421875,
    },
    objectId: 4,
    confidence: 0.9853515625,
    feature: '',
    qualityScore: 0.444091796875,
    faceCorrectImage: '',
    norm: 0,
    pedestrianPropertysList: [],
    extendRect: {
      topleft: {
        x: 0.1145833358168602,
        y: 0.2890625,
      },
      width: 0.1510416716337204,
      height: 0.150390625,
    },
    featureId: '1673516133661036552',
    r1: 2.716488838195801,
    r2: 0.7334586977958679,
  },
  {
    algorithmVersion: 7,
    rect: {
      topleft: {
        x: 0.0026041667442768812,
        y: 0.248046875,
      },
      width: 0.3776041567325592,
      height: 0.728515625,
    },
    objectId: 4,
    confidence: 0.9792072772979736,
    feature: '',
    qualityScore: 0,
    faceCorrectImage: '',
    norm: 1.783203125,
    pedestrianPropertysList: [
      0.018585205078125, 0.017852783203125, 0.9814453125, 0.0323486328125, 0.06439208984375, 0.0203704833984375,
      0.0489501953125, 0.310546875, 0.76953125, 0.0302734375, 0.978515625, 0.038543701171875, 0.242919921875,
      0.07684326171875, 0.491943359375, 0.493408203125, 0.92333984375, 0.11553955078125, 0.058349609375,
      0.040924072265625, 0.06866455078125, 0.042388916015625, 0.036773681640625, 0.118408203125, 0.10858154296875,
      0.0268096923828125, 0.0235137939453125, 0.03289794921875, 0.070068359375, 0.044769287109375, 0.9287109375,
      0.024932861328125, 0.98974609375, 0.033721923828125, 0.033599853515625, 0.0177154541015625, 0.020294189453125,
      0.03326416015625, 0.87646484375, 0.0216522216796875, 0.03436279296875, 0.1688232421875, 0.0181884765625,
      0.034088134765625, 0.037109375, 0.036346435546875, 0.1044921875, 0.0282135009765625, 0.981414794921875,
      0.93560791015625, 0.9796295166015625, 0.9510498046875, 0.021484375,
    ],
    extendRect: {
      topleft: {
        x: 0,
        y: 0.06640625,
      },
      width: 0.9348958134651184,
      height: 0.93359375,
    },
    featureId: '1673516133661036553',
    r1: 0,
    r2: 0,
  },
].map((v, index) => {
  const width = 211;
  const height = 281;
  return {
    id: index,
    x: v['rect']['topleft']['x'] * width,
    y: v['rect']['topleft']['y'] * width,
    w: v['rect']['width'] * height,
    h: v['rect']['height'] * height,
  };
});

export const mockRectList = [
  {
    name: 'analysiscells/1795718072015781889',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_BIKE',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855865614Z',
    trackId: '1795718072015781889',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 705,
      y: 294,
      width: 90,
      height: 81,
    },
    confidence: 0.36078432,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781890',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_BIKE',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855876404Z',
    trackId: '1795718072015781890',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 663,
      y: 256,
      width: 54,
      height: 76,
    },
    confidence: 0.6039216,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781891',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_BIKE',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855879144Z',
    trackId: '1795718072015781891',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 771,
      y: 324,
      width: 91,
      height: 94,
    },
    confidence: 0.65882355,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781892',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_BIKE',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855881384Z',
    trackId: '1795718072015781892',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 701,
      y: 291,
      width: 84,
      height: 78,
    },
    confidence: 0.36078432,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781893',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_PED',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855883934Z',
    trackId: '1795718072015781893',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 872,
      y: 306,
      width: 35,
      height: 83,
    },
    confidence: 0.4117647,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781894',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_PED',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855888874Z',
    trackId: '1795718072015781894',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 641,
      y: 178,
      width: 37,
      height: 65,
    },
    confidence: 0.4862745,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781895',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_PED',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855892114Z',
    trackId: '1795718072015781895',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 406,
      y: 179,
      width: 29,
      height: 61,
    },
    confidence: 0.8117647,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781896',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_PED',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855894975Z',
    trackId: '1795718072015781896',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 290,
      y: 133,
      width: 26,
      height: 55,
    },
    confidence: 0.8235294,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781897',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_PED',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855897945Z',
    trackId: '1795718072015781897',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 821,
      y: 365,
      width: 67,
      height: 201,
    },
    confidence: 0.84705883,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781898',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_PED',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855901055Z',
    trackId: '1795718072015781898',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 497,
      y: 215,
      width: 42,
      height: 105,
    },
    confidence: 0.93333334,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
  {
    name: 'analysiscells/1795718072015781899',
    analysisJobName: '',
    source: 'ANALYSIS_CELL_SOURCE_OD',
    originalName: '',
    originalSource: 'ANALYSIS_CELL_SOURCE_UNSPECIFIED',
    originalFrameId: '0',
    type: 'ANALYSIS_CELL_TYPE_PED',
    frameId: '1795718072015781888',
    timestamp: '2024-05-29T07:25:25.855907565Z',
    trackId: '1795718072015781899',
    bestInTrack: true,
    frameImageUrl: '',
    frameWidth: 1280,
    frameHeight: 720,
    objectImageUrl: '',
    rect: {
      x: 941,
      y: 515,
      width: 90,
      height: 205,
    },
    confidence: 0.94509804,
    face: null,
    metadata: {
      location: '',
      deviceName: '',
      originalCellPicName: '',
      feature: '',
      featureVer: 0,
      faceFeature: '',
      faceFeatureVer: 0,
      featureEntityName: '',
      faceFeatureEntityName: '',
    },
  },
].map((v, index) => {
  return {
    id: v.name,
    x: v.rect.x,
    y: v.rect.y,
    w: v.rect.width,
    h: v.rect.height,

    showRectAnyway: index == 1,
  };
});

console.log('mockRectList', mockRectList, mockRectList1);

export let mock = [
  {
    data: [
      { x: 206.90498046874995, y: 169.97207031250002 },
      { x: 206.90498046874995, y: 169.97216796875006 },
      { x: 237.35009765625, y: 691.0166015625002 },
      { x: 949.6070312500001, y: 607.2760742187502 },
      { x: 845.3326171875001, y: 151.63310546875005 },
      { x: 574.53984375, y: 70.94736328125003 },
    ],
    properties: {
      id: 'polygon-227',
      isHover: false,
      isActive: false,
      isDrag: false,
      isDraw: false,
      createTime: 1689244827486,
      nodes: [
        {
          data: { x: 206.90498046874995, y: 169.97207031250002 },
          properties: { id: 'point-224', isHover: false, isActive: false, isDrag: false, createTime: 1689244827485 },
        },
        {
          data: { x: 206.90498046874995, y: 169.97216796875006 },
          properties: { id: 'point-228', isHover: false, isActive: false, isDrag: false, createTime: 1689244827583 },
        },
        {
          data: { x: 237.35009765625, y: 691.0166015625002 },
          properties: { id: 'point-294', isHover: false, isActive: false, isDrag: false, createTime: 1689244828135 },
        },
        {
          data: { x: 949.6070312500001, y: 607.2760742187502 },
          properties: { id: 'point-368', isHover: false, isActive: false, isDrag: false, createTime: 1689244828617 },
        },
        {
          data: { x: 845.3326171875001, y: 151.63310546875005 },
          properties: { id: 'point-436', isHover: false, isActive: false, isDrag: false, createTime: 1689244829168 },
        },
        {
          data: { x: 574.53984375, y: 70.94736328125003 },
          properties: { id: 'point-512', isHover: false, isActive: false, isDrag: false, createTime: 1689244829834 },
        },
      ],
      line: {
        data: [
          { x: 206.90498046874995, y: 169.97207031250002 },
          { x: 206.90498046874995, y: 169.97216796875006 },
          { x: 237.35009765625, y: 691.0166015625002 },
          { x: 949.6070312500001, y: 607.2760742187502 },
          { x: 845.3326171875001, y: 151.63310546875005 },
          { x: 574.53984375, y: 70.94736328125003 },
          { x: 206.90498046874995, y: 169.97207031250002 },
        ],
        properties: {
          id: 'line-226',
          isHover: false,
          isActive: false,
          isDrag: false,
          isDraw: false,
          createTime: 1689244827486,
          nodes: [
            {
              data: { x: 206.90498046874995, y: 169.97207031250002 },
              properties: {
                id: 'point-224',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244827485,
              },
            },
            {
              data: { x: 206.90498046874995, y: 169.97216796875006 },
              properties: {
                id: 'point-228',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244827583,
              },
            },
            {
              data: { x: 237.35009765625, y: 691.0166015625002 },
              properties: {
                id: 'point-294',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244828135,
              },
            },
            {
              data: { x: 949.6070312500001, y: 607.2760742187502 },
              properties: {
                id: 'point-368',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244828617,
              },
            },
            {
              data: { x: 845.3326171875001, y: 151.63310546875005 },
              properties: {
                id: 'point-436',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244829168,
              },
            },
            {
              data: { x: 574.53984375, y: 70.94736328125003 },
              properties: {
                id: 'point-512',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244829834,
              },
            },
            {
              data: { x: 206.90498046874995, y: 169.97207031250002 },
              properties: {
                id: 'point-514',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244829969,
              },
            },
          ],
        },
      },
    },
  },
];
