import { realpathSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import copy from '@hexatool/fs-copy';
import remove from '@hexatool/fs-remove';
import { makeTemporaryDir } from '@hexatool/fs-temporary';
import { fdir as Builder } from 'fdir';
import onExit from 'signal-exit';

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
				remove(temp);
			} catch (e) {
				err = e;
			}
		}
		this.created.slice(0);
		if (err) {
			throw err;
		}
	}

	copy(name: string): string {
		const src = this.find(name);
		const dest = join(this.temp(), name);
		copy(src, dest);

		return dest;
	}

	find(name: string): string {
		let search = this.cwd;
		let match;
		do {
			const globs = (
				typeof this.options.glob === 'string' ? [this.options.glob] : this.options.glob
			).map(g => join(search, g));

			const paths = (
				new Builder()
					.withFullPaths()
					.withMaxDepth(2)
					.withDirs()
					.glob(...globs)
					.crawl(search)
					.sync() as string[]
			).map(p => (p.endsWith('/') ? p.slice(0, -1) : p));

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
		const tmp = makeTemporaryDir();
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
