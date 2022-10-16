import * as fs from 'node:fs';
import path from 'node:path';
import fse from 'fs-extra';
import { describe, expect, it, vi } from 'vitest';

import fixtures from '../src';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const NESTED_DIR = path.join(FIXTURES_DIR, 'nested');

const f = fixtures(NESTED_DIR);

describe('@hexatool/fixtures', () => {
	describe('find', () => {
		it('should find in the current dir', async function () {
			const expected = path.join(NESTED_DIR, '__fixtures__', 'bar');
			const result = await f.find('bar');
			expect(result).toBe(expected);
		});
		it('should find in the parent dir', async function () {
			const expected = path.join(FIXTURES_DIR, '__fixtures__', 'foo');
			const result = await f.find('foo');
			expect(result).toBe(expected);
		});
		it('should find with file name', async function () {
			const expected = path.join(NESTED_DIR, '__fixtures__', 'baz.txt');
			const result = await f.find('baz.txt');
			expect(result).toBe(expected);
		});
		it('should find throw if no match', async function () {
			await expect(f.find('nope')).rejects.toThrow();
		});
	});
	describe('temp', () => {
		it('should works', function () {
			const temp = f.temp();
			expect(fs.lstatSync(temp).isDirectory()).toBeTruthy();
		});
	});
	describe('cleanup', () => {
		it('should works', async function () {
			const file = await f.copy('baz.txt');
			expect(fs.lstatSync(file).isFile()).toBeTruthy();
			f.cleanup();
			expect(() => fs.lstatSync(file)).toThrow(
				`ENOENT: no such file or directory, lstat '${file}'`
			);
		});
		it('should throw an exception if removeSync throw an exception', async function () {
			const removeSyncSpy = vi.spyOn(fse, 'removeSync');
			removeSyncSpy.mockImplementationOnce(() => {
				throw new Error('An error');
			});
			const file = await f.copy('baz.txt');
			expect(fs.lstatSync(file).isFile()).toBeTruthy();
			expect(() => f.cleanup()).toThrow('An error');
		});
	});
	describe('copy', () => {
		it('should copy with directory', async function () {
			const dir = await f.copy('bar');
			// TODO: Check better way to check this
			// expect(fs.lstatSync(path.join(dir, 'symlink-to-file')).isSymbolicLink()).toBeTruthy();
			expect(fs.lstatSync(path.join(dir, 'file.txt')).isFile()).toBeTruthy();
			expect(fs.lstatSync(path.join(dir, 'nested')).isDirectory()).toBeTruthy();
			expect(fs.lstatSync(path.join(dir, 'nested', 'nested-file.txt')).isFile()).toBeTruthy();
		});
		it('should copy with file', async function () {
			const file = await f.copy('baz.txt');
			expect(fs.lstatSync(file).isFile()).toBeTruthy();
		});
		it('should copy with directory returns realpath', async function () {
			const dir = await f.copy('bar');
			expect(dir).toBe(fs.realpathSync(dir));
		});
		it('should copy with file returns realpath', async function () {
			const file = await f.copy('baz.txt');
			expect(file).toBe(fs.realpathSync(file));
		});
	});
	describe('options.glob', () => {
		it('should works', async function () {
			const f = fixtures(NESTED_DIR, { glob: ['other-fixtures/*'] });
			const file = await f.find('file.txt');
			const expected = path.join(FIXTURES_DIR, 'other-fixtures', 'file.txt');
			expect(file).toBe(expected);
		});
	});
	describe('options.root', () => {
		it('should works', async function () {
			const f = fixtures(NESTED_DIR, { root: NESTED_DIR });
			await expect(f.find('foo')).rejects.toThrow();
		});
	});
});
