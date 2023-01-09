import * as fs from 'node:fs';
import path from 'node:path';

import remove from '@hexatool/fs-remove';
import { describe, expect, it, vi } from 'vitest';

import fixtures from '../src';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const NESTED_DIR = path.join(FIXTURES_DIR, 'nested');

const f = fixtures(NESTED_DIR);

vi.mock('@hexatool/fs-remove', async () => {
	const original = await vi.importActual<typeof import('@hexatool/fs-remove')>(
		'@hexatool/fs-remove'
	);

	return {
		default: vi.fn<[string], void>(value => original.default(value)),
	};
});

describe('@hexatool/fixtures', () => {
	describe('find', () => {
		it('should find in the current dir', () => {
			const expected = path.join(NESTED_DIR, '__fixtures__', 'bar');
			const result = f.find('bar');
			expect(result).toBe(expected);
		});
		it('should find in the parent dir', () => {
			const expected = path.join(FIXTURES_DIR, '__fixtures__', 'foo');
			const result = f.find('foo');
			expect(result).toBe(expected);
		});
		it('should find with file name', () => {
			const expected = path.join(NESTED_DIR, '__fixtures__', 'baz.txt');
			const result = f.find('baz.txt');
			expect(result).toBe(expected);
		});
		it('should find throw if no match', () => {
			expect(() => f.find('nope')).toThrow();
		});
	});
	describe('temp', () => {
		it('should works', function () {
			const temp = f.temp();
			expect(fs.lstatSync(temp).isDirectory()).toBeTruthy();
		});
	});
	describe('cleanup', () => {
		it('should works', () => {
			const file = f.copy('baz.txt');
			expect(fs.lstatSync(file).isFile()).toBeTruthy();
			f.cleanup();
			expect(() => fs.lstatSync(file)).toThrow(
				`ENOENT: no such file or directory, lstat '${file}'`
			);
		});
		it('should throw an exception if removeSync throw an exception', () => {
			const removeSpy = vi.mocked(remove);
			removeSpy.mockImplementationOnce(() => {
				throw new Error('An error');
			});
			const file = f.copy('baz.txt');
			expect(fs.lstatSync(file).isFile()).toBeTruthy();
			expect(() => f.cleanup()).toThrow('An error');
		});
	});
	describe('copy', () => {
		it('should copy with directory', () => {
			const dir = f.copy('bar');
			// TODO: Check better way to check this
			// expect(fs.lstatSync(path.join(dir, 'symlink-to-file')).isSymbolicLink()).toBeTruthy();
			expect(fs.lstatSync(path.join(dir, 'file.txt')).isFile()).toBeTruthy();
			expect(fs.lstatSync(path.join(dir, 'nested')).isDirectory()).toBeTruthy();
			expect(fs.lstatSync(path.join(dir, 'nested', 'nested-file.txt')).isFile()).toBeTruthy();
		});
		it('should copy with file', () => {
			const file = f.copy('baz.txt');
			expect(fs.lstatSync(file).isFile()).toBeTruthy();
		});
		it('should copy with directory returns realpath', () => {
			const dir = f.copy('bar');
			expect(dir).toBe(fs.realpathSync(dir));
		});
		it('should copy with file returns realpath', () => {
			const file = f.copy('baz.txt');
			expect(file).toBe(fs.realpathSync(file));
		});
	});
	describe('options.glob', () => {
		it('should works', () => {
			const f = fixtures(NESTED_DIR, { glob: ['other-fixtures/*'] });
			const file = f.find('file.txt');
			const expected = path.join(FIXTURES_DIR, 'other-fixtures', 'file.txt');
			expect(file).toBe(expected);
		});
	});
	describe('options.root', () => {
		it('should works', () => {
			const f = fixtures(NESTED_DIR, { root: NESTED_DIR });
			expect(() => f.find('foo')).toThrow();
		});
	});
});
