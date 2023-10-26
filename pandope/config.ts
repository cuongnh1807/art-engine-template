export const layers = [
  {
    name: "Body",
    probability: 1.0,
    zIndex: 20,
    options: [
      {
        name: "Default",
        file: "Body/PanDope-character.png",
        weight: 1
      }
    ]
  },
  {
    name: "Glasses",
    probability: 0.725375,
    zIndex: 30,
    options: [
      {
        name: "Urban",
        file: "glasses/urban.png",
        weight: 0.35,
      }
    ]
  },
  {
    name: "Shirt - Tatoo",
    probability: 0.92435625,
    zIndex: 30,
    options: [
      {
        name: "Urban",
        file: "shirt/urban.png",
        weight: 0.6,
      }
    ]
  },
  {
    name: "Hat",
    probability: 0.94824375,
    zIndex: 20,
    options: [
      {
        name: "Futuristic",
        file: "Hat/futuristic.png",
        weight: 0.35,
      }
    ]
  },

  {
    name: "Wing",
    probability: 0.0975,
    zIndex: 10,
    options: [
      {
        name: "Futuristic",
        file: "wing/futuristic.png",
        weight: 0.05,
      },
      {
        name: "Mythic",
        file: "wing/mythic.png",
        weight: 0.05,
      }
    ]
  }
]