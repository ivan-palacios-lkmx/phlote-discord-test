declare module "fake-progress" {
  interface FakeProgressOptions {
    timeConstant: number;
    autoStart: boolean;
  }

  class FakeProgress {
    progress: number;
    constructor(options: FakeProgressOptions);
    setProgress(value: number): void;
    end(): void;
  }

  export = FakeProgress;
}
