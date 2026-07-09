import { CopyCommand } from './copy-command';

export function GetStarted() {
  return (
    <section id="install" className="relative">
      <div className="mx-auto max-w-720 px-5 sm:px-8 py-12 sm:py-16 lg:py-22">
        <div className="flex flex-col items-center text-center gap-4">
          <p className="caption">Get started</p>
          <h2 className="text-28 sm:text-34 font-light tracking-tight leading-1.15">
            Make your first frame in the next minute.
          </h2>

          <p className="max-w-560 text-16 leading-normal text-body">
            One command, zero config. Your agent takes it from here.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <CopyCommand command="npx @open-frame/cli init" />
          </div>
        </div>
      </div>
    </section>
  );
}
