import {describe, it} from 'node:test';
import {ok} from 'node:assert';
import {createHash} from 'node:crypto';

import {
	fixtureMacho,
	chunkedHashes,
	machoArch,
	dataContains
} from '../util.spec.ts';
import {CodeDirectory} from './codedirectory.ts';
import {
	cdRequirementsSlot,
	CPU_TYPE_ARM64,
	CPU_TYPE_X86_64,
	kSecCodeExecSegMainBinary,
	kSecCodeSignatureAdhoc,
	kSecCodeSignatureHashSHA256,
	kSecCodeSignatureLinkerSigned
} from '../const.ts';

// eslint-disable-next-line no-bitwise
const flagsLinker = kSecCodeSignatureAdhoc | kSecCodeSignatureLinkerSigned;

const emptyRequirements = Buffer.from(
	'fa de 0c 01 00 00 00 0c 00 00 00 00'.replaceAll(' ', ''),
	'hex'
);

const emptyRequirementsSha256 = new Uint8Array(
	createHash('sha256').update(emptyRequirements).digest()
);

async function addCodeHashes(
	cd: CodeDirectory,
	macho: Readonly<Uint8Array>,
	algo: string
) {
	const {pageSize} = cd;
	const hashes = await chunkedHashes(
		algo,
		macho,
		pageSize ? Math.pow(2, pageSize) : 0,
		0,
		cd.codeLimit
	);
	for (let i = hashes.length; i--; ) {
		cd.setSlot(i, false, hashes[i]);
	}
}

void describe('blob/codedirectory', () => {
	void describe('CodeDirectory', () => {
		void describe('fixtures', () => {
			void it('cli arm64 a', async () => {
				const [main] = await fixtureMacho('cli', 'arm64', ['a/main']);

				for (const cputype of [CPU_TYPE_ARM64]) {
					const arch = machoArch(main, cputype);

					const cd = new CodeDirectory();
					cd.version = CodeDirectory.supportsExecSegment;
					cd.flags = flagsLinker;
					cd.codeLimit = 0xc140;
					cd.hashType = kSecCodeSignatureHashSHA256;
					cd.pageSize = 0xc;
					cd.execSegLimit = 0x4000n;
					cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
					cd.identifier = 'main';
					// eslint-disable-next-line no-await-in-loop
					await addCodeHashes(cd, arch, 'SHA-256');

					const data = new Uint8Array(cd.byteLength);
					cd.byteWrite(data);
					ok(dataContains(arch, data, true), `CD: ${cputype}`);
				}
			});

			void it('cli arm64 us', async () => {
				const [main] = await fixtureMacho('cli', 'arm64', ['us/main']);

				for (const cputype of [CPU_TYPE_ARM64]) {
					const arch = machoArch(main, cputype);

					const cd = new CodeDirectory();
					cd.version = CodeDirectory.supportsExecSegment;
					cd.flags = kSecCodeSignatureAdhoc;
					cd.codeLimit = 0xc140;
					cd.hashType = kSecCodeSignatureHashSHA256;
					cd.pageSize = 0xc;
					cd.execSegLimit = 0x4000n;
					cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
					cd.identifier =
						'main-55554944e804d5060a0e3eeb86e3a4c04e71e5d0';
					cd.setSlot(
						-cdRequirementsSlot,
						false,
						emptyRequirementsSha256
					);
					// eslint-disable-next-line no-await-in-loop
					await addCodeHashes(cd, arch, 'SHA-256');

					const data = new Uint8Array(cd.byteLength);
					cd.byteWrite(data);
					ok(dataContains(arch, data, true), `CD: ${cputype}`);
				}
			});

			void it('cli x86_64-arm64 a', async () => {
				const [main] = await fixtureMacho('cli', 'x86_64-arm64', [
					'a/main'
				]);

				for (const cputype of [CPU_TYPE_ARM64]) {
					const arch = machoArch(main, cputype);

					const cd = new CodeDirectory();
					cd.version = CodeDirectory.supportsExecSegment;
					cd.flags = flagsLinker;
					cd.codeLimit = 0xc140;
					cd.hashType = kSecCodeSignatureHashSHA256;
					cd.pageSize = 0xc;
					cd.execSegLimit = 0x4000n;
					cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
					cd.identifier = 'main-80d268.out';
					// eslint-disable-next-line no-await-in-loop
					await addCodeHashes(cd, arch, 'SHA-256');

					const data = new Uint8Array(cd.byteLength);
					cd.byteWrite(data);
					ok(dataContains(arch, data, true), `CD: ${cputype}`);
				}
			});

			void it('cli x86_64-arm64 us', async () => {
				const [main] = await fixtureMacho('cli', 'x86_64-arm64', [
					'us/main'
				]);

				for (const cputype of [CPU_TYPE_X86_64, CPU_TYPE_ARM64]) {
					const arch = machoArch(main, cputype);

					const cd = new CodeDirectory();
					cd.version = CodeDirectory.supportsExecSegment;
					cd.flags = kSecCodeSignatureAdhoc;
					cd.codeLimit = 0xc140;
					cd.hashType = kSecCodeSignatureHashSHA256;
					cd.pageSize = 0xc;
					cd.execSegLimit = 0x4000n;
					cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
					cd.identifier =
						'main-55554944886472fa430a3a73b2ae1ee2ece2c09f';
					cd.setSlot(
						-cdRequirementsSlot,
						false,
						emptyRequirementsSha256
					);
					// eslint-disable-next-line no-await-in-loop
					await addCodeHashes(cd, arch, 'SHA-256');

					const data = new Uint8Array(cd.byteLength);
					cd.byteWrite(data);
					ok(dataContains(arch, data, true), `CD: ${cputype}`);
				}
			});

			void it('dll arm64 a', async () => {
				const [main, sample] = await fixtureMacho('dll', 'arm64', [
					'a/main',
					'a/sample.dylib'
				]);

				for (const cputype of [CPU_TYPE_ARM64]) {
					{
						const arch = machoArch(main, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = flagsLinker;
						cd.codeLimit = 0xc170;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
						cd.identifier = 'main';
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);

						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}

					{
						const arch = machoArch(sample, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = flagsLinker;
						cd.codeLimit = 0x4070;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.identifier = 'sample.dylib';
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);
						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}
				}
			});

			void it('dll arm64 us', async () => {
				const [main, sample] = await fixtureMacho('dll', 'arm64', [
					'us/main',
					'us/sample.dylib'
				]);

				for (const cputype of [CPU_TYPE_ARM64]) {
					{
						const arch = machoArch(main, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = kSecCodeSignatureAdhoc;
						cd.codeLimit = 0xc170;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
						cd.identifier =
							'main-55554944613d9525ada83f888441f9d35582a4e5';
						cd.setSlot(
							-cdRequirementsSlot,
							false,
							emptyRequirementsSha256
						);
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);

						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}

					{
						const arch = machoArch(sample, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = kSecCodeSignatureAdhoc;
						cd.codeLimit = 0x4070;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.identifier =
							'sample-55554944d6b41636296c33ffae676ce19c551fc0';
						cd.setSlot(
							-cdRequirementsSlot,
							false,
							emptyRequirementsSha256
						);
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);
						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}
				}
			});

			void it('dll x86_64-arm64 a', async () => {
				const [main, sample] = await fixtureMacho(
					'dll',
					'x86_64-arm64',
					['a/main', 'a/sample.dylib']
				);

				for (const cputype of [CPU_TYPE_ARM64]) {
					{
						const arch = machoArch(main, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = flagsLinker;
						cd.codeLimit = 0xc170;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
						cd.identifier = 'main-100ddc.out';
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);

						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}

					{
						const arch = machoArch(sample, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = flagsLinker;
						cd.codeLimit = 0x4070;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.identifier = 'sample-c9498b.out';
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);
						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}
				}
			});

			void it('dll x86_64-arm64 us', async () => {
				const [main, sample] = await fixtureMacho(
					'dll',
					'x86_64-arm64',
					['us/main', 'us/sample.dylib']
				);

				for (const cputype of [CPU_TYPE_X86_64, CPU_TYPE_ARM64]) {
					{
						const arch = machoArch(main, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = kSecCodeSignatureAdhoc;
						cd.codeLimit = 0xc170;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.execSegFlags = BigInt(kSecCodeExecSegMainBinary);
						cd.identifier =
							'main-55554944cc85da74bbfc35efb8119422ef7133fe';
						cd.setSlot(
							-cdRequirementsSlot,
							false,
							emptyRequirementsSha256
						);
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);

						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}

					{
						const arch = machoArch(sample, cputype);

						const cd = new CodeDirectory();
						cd.version = CodeDirectory.supportsExecSegment;
						cd.flags = kSecCodeSignatureAdhoc;
						cd.codeLimit = 0x4070;
						cd.hashType = kSecCodeSignatureHashSHA256;
						cd.pageSize = 0xc;
						cd.execSegLimit = 0x4000n;
						cd.identifier =
							'sample-5555494413b411fac8ad3aa7997063d599538081';
						cd.setSlot(
							-cdRequirementsSlot,
							false,
							emptyRequirementsSha256
						);
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(cd, arch, 'SHA-256');

						const data = Buffer.alloc(cd.byteLength);
						cd.byteWrite(data);
						ok(dataContains(arch, data, true), `CD: ${cputype}`);
					}
				}
			});
		});
	});
});
