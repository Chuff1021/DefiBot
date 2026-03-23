type StatusPayload = {
  ok: boolean;
  projectName: string;
  summary: {
    enabledChains: number;
    enabledVenues: number;
    strategyFamilies: number;
  };
  runtime: {
    mode: string;
    platform: string;
  };
};

export default function handler(_request: unknown, response: { status: (code: number) => { json: (body: StatusPayload) => void } }) {
  response.status(200).json({
    ok: true,
    projectName: "DefiBot",
    summary: {
      enabledChains: 3,
      enabledVenues: 3,
      strategyFamilies: 3,
    },
    runtime: {
      mode: "scaffold",
      platform: "vercel",
    },
  });
}
