import {describe, it} from 'node:test';
import {deepStrictEqual, notStrictEqual, strictEqual} from 'node:assert';

import {
	fixtureMacho,
	hash,
	chunkedHashes,
	machoThin,
	fixtureMachos,
	unhex
} from './util.spec.ts';
import {CodeDirectory} from './codedirectory.ts';
import {cdInfoSlot, cdRequirementsSlot, cdResourceDirSlot} from './const.ts';
import {stringToBytes} from './util.ts';
import {ReadonlyUint8Array} from './type.ts';
import {CodeDirectoryBuilder} from './codedirectorybuilder.ts';

const emptyRequirements = unhex('FA DE 0C 01 00 00 00 0C 00 00 00 00');

async function addCodeHashes(
	cd: CodeDirectoryBuilder,
	macho: ReadonlyUint8Array
) {
	const {pageSize} = cd;
	const hashes = await chunkedHashes(
		cd.hashType,
		macho,
		pageSize ? Math.pow(2, pageSize) : 0,
		0,
		cd.execLength
	);
	for (let i = hashes.length; i--; ) {
		cd.setCodeSlot(i, hashes[i]);
	}
}

const fixtures = fixtureMachos();

void describe('blob/codedirectory', () => {
	void describe('fixtures', () => {
		for (const {kind, arch, file, archs} of fixtures) {
			// Skip binaries with no signed architectures.
			if (![...archs.values()].filter(Boolean).length) {
				continue;
			}

			void it(`${kind}: ${arch}: ${file}`, async () => {
				let resources: string[] | null = null;
				const bundle = file.match(
					/^((.*\/)?([^./]+\.(app|framework)))\/([^.]+\/)[^/]+$/
				);
				if (bundle) {
					const [, path, , , ext] = bundle;
					resources =
						ext === 'framework'
							? [
									'Resources/Info.plist',
									'_CodeSignature/CodeResources'
								].map(s => `${path}/Versions/A/${s}`)
							: [
									'Info.plist',
									'_CodeSignature/CodeResources'
								].map(s => `${path}/Contents/${s}`);
				}

				const files = await fixtureMacho(kind, arch, [
					file,
					...(resources || [])
				]);
				const [macho] = files;
				const infoPlist = resources ? files[1] : null;
				const codeResources = resources ? files[2] : null;

				for (const [arc, info] of archs) {
					if (!info) {
						continue;
					}

					const thin = machoThin(macho, info.arch[0], info.arch[1]);

					const {requirements} = info;
					for (const hashType of info.hashes) {
						const message = `CD: ${arc}: hashType=${hashType}`;
						const builder = new CodeDirectoryBuilder(hashType);
						builder.flags = info.flags;
						builder.execLength = info.offset;
						builder.pageSize = info.page;
						builder.execSegOffset = BigInt(info.execsegbase);
						builder.execSegLimit = BigInt(info.execseglimit);
						builder.execSegFlags = BigInt(info.execsegflags);
						builder.identifier = stringToBytes(info.identifier);
						builder.teamID = stringToBytes(info.teamid);
						if (infoPlist) {
							builder.setSpecialSlot(
								cdInfoSlot,
								// eslint-disable-next-line no-await-in-loop
								await hash(hashType, infoPlist)
							);
						}
						switch (requirements) {
							case '': {
								// No requirements.
								break;
							}
							case 'count=0 size=12': {
								builder.setSpecialSlot(
									cdRequirementsSlot,
									// eslint-disable-next-line no-await-in-loop
									await hash(hashType, emptyRequirements)
								);
								break;
							}
							default: {
								throw new Error(
									`Unexpected requirements: ${requirements}`
								);
							}
						}
						if (codeResources) {
							builder.setSpecialSlot(
								cdResourceDirSlot,
								// eslint-disable-next-line no-await-in-loop
								await hash(hashType, codeResources)
							);
						}
						// eslint-disable-next-line no-await-in-loop
						await addCodeHashes(builder, thin);

						// Offical library always minimum supports scatter.
						strictEqual(
							Math.max(
								builder.version,
								CodeDirectory.supportsScatter
							),
							info.version
						);

						const cd = builder.build(info.version);
						const data = new Uint8Array(cd.byteLength);
						cd.byteWrite(data);
						notStrictEqual(
							Buffer.from(thin).compare(
								Buffer.from(data),
								info.offset
							),
							-1,
							message
						);

						const cd2 = new CodeDirectory();
						cd2.byteRead(data);
						deepStrictEqual(cd, cd2, message);

						strictEqual(
							cd2.nSpecialSlots,
							cd.nSpecialSlots,
							message
						);
						for (let i = 0; i < cd2.nSpecialSlots; i++) {
							const nulled = new Uint8Array(cd.hashSize);
							deepStrictEqual(
								cd2.getSlot(-1 - i, false),
								cd.getSlot(-1 - i, false) || nulled,
								message
							);
						}

						strictEqual(cd2.nCodeSlots, cd.nCodeSlots, message);
						for (let i = 0; i < cd2.nCodeSlots; i++) {
							deepStrictEqual(
								cd2.getSlot(i, false),
								cd.getSlot(i, false),
								message
							);
							deepStrictEqual(
								cd2.getSlot(i, true),
								cd.getSlot(i, true),
								message
							);
						}
					}
				}
			});
		}
	});
});
