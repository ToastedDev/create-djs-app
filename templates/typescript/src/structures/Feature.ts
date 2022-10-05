import { client } from "..";

export class Feature {
  constructor(public run: (c: typeof client) => any) {}
}
