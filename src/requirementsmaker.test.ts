import {describe, it} from 'node:test';
import {deepStrictEqual, strictEqual} from 'node:assert';

import {Requirements} from './requirements.ts';
import {
	kSecDesignatedRequirementType,
	kSecHostRequirementType
} from './const.ts';
import {Requirement} from './requirement.ts';
import {unhex} from './util.spec.ts';
import {RequirementsMaker} from './requirementsmaker.ts';
import {viewDataR} from './util.ts';

void describe('requirementsmaker', () => {
	void it('empty', () => {
		const rs = new RequirementsMaker().make();
		const d = new Uint8Array(rs.byteLength);
		rs.byteWrite(d);
		deepStrictEqual(d, unhex('FA DE 0C 01 00 00 00 0C 00 00 00 00'));

		const rs2 = new Requirements();
		strictEqual(rs2.byteRead(d), d.byteLength);
		deepStrictEqual(rs2, rs);
	});

	void it('host + designated', () => {
		const hostData = unhex(
			'00 00 00 01 00 00 00 02 00 00 00 0E',
			'63 6F 6D 2E 61 70 70 6C 65 2E 68 6F 73 74 00 00'
		);
		const designatedData = unhex(
			'00 00 00 01 00 00 00 02 00 00 00 14',
			'63 6F 6D 2E 61 70 70 6C 65 2E 64 65 73 69 67 6E 61 74 65 64'
		);
		const data = unhex(
			'FA DE 0C 01 00 00 00 68',
			'00 00 00 02',
			'00 00 00 01 00 00 00 1C',
			'00 00 00 03 00 00 00 40',
			'FA DE 0C 00 00 00 00 24',
			Buffer.from(hostData).toString('hex'),
			'FA DE 0C 00 00 00 00 28',
			Buffer.from(designatedData).toString('hex')
		);
		const rsm = new RequirementsMaker();
		rsm.add(kSecHostRequirementType, Requirement.blobify(hostData));
		rsm.add(
			kSecDesignatedRequirementType,
			Requirement.blobify(designatedData)
		);
		const rs = rsm.make();
		const d = new Uint8Array(rs.byteLength);
		rs.byteWrite(d);
		deepStrictEqual(d, data);

		const rs2 = new Requirements();
		strictEqual(rs2.byteRead(d), d.byteLength);
		deepStrictEqual(rs2, rs);

		for (const type of [
			kSecDesignatedRequirementType,
			kSecHostRequirementType,
			0
		]) {
			const a = rs.find(type);
			const b = rs2.find(type);
			if (!a || !b) {
				deepStrictEqual(a, b, `type: ${type}`);
				continue;
			}
			deepStrictEqual(viewDataR(a), viewDataR(b), `type: ${type}`);
		}
	});
});