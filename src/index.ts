import { basename, dirname, join } from 'node:path';

import { copySync, realpathSync, removeSync } from 'fs-extra';
import { globby } from 'globby';
import onExit from 'signal-exit';
import { temporaryDirectory } from 'tempy';

export interface FixturesOptions {
	cleanup: boolean;
	glob: Array<string> | string;
	root: string;
}

const DEFAULT_OPTIONS: FixturesOptions = {
	glob: '{fixtures,__fixtures__}/*',
	cleanup: true,
	root: '/',
};

export class Fixtures {
	readonly created: string[];

	constructor(readonly cwd: string, readonly options: FixturesOptions) {
		this.created = [];
		if (options.cleanup) {
			onExit(() => this.cleanup());
		}
	}

	cleanup(): void {
		let err;
		for (const temp of this.created) {
			try {
				removeSync(temp);
			} catch (e) {
				err = e;
			}
		}
		this.created.slice(0);
		if (err) {
			throw err;
		}
	}

	async copy(name: string): Promise<string> {
		const src = await this.find(name);
		const dest = join(this.temp(), name);
		copySync(src, dest);

		return dest;
	}

	async find(name: string): Promise<string> {
		let search = this.cwd;
		let match;
		do {
			/* eslint no-await-in-loop: "warn" */
			const paths = await globby(this.options.glob, {
				cwd: search,
				onlyFiles: false,
				absolute: true,
			});

			const matches = paths.find(filePath => basename(filePath) === name);

			if (matches) {
				match = matches;
				break;
			}

			if (search === this.options.root) {
				break;
			}
		} while ((search = dirname(search)));

		if (!match) {
			throw new Error(
				`No fixture named "${name}" found searching for ${JSON.stringify(
					this.options.glob
				)} in "${this.cwd}" or any parent directory`
			);
		}

		return match;
	}

	temp(): string {
		const tmp = temporaryDirectory();
		const tempDir = realpathSync(tmp);
		this.created.push(tempDir);

		return tempDir;
	}
}

export default function fixtures(
	cwd: string,
	opts?: Partial<FixturesOptions> | undefined
): Fixtures {
	return new Fixtures(cwd, opts ? { ...DEFAULT_OPTIONS, ...opts } : DEFAULT_OPTIONS);
}
