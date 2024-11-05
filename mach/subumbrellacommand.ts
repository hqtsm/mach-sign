/* eslint-disable max-classes-per-file */
import { Struct, structT, structU32 } from '../struct.ts';
import { LcStr, LcStrBE } from './lcstr.ts';

/**
 * Sub umbrella command.
 */
export class SubUmbrellaCommand extends Struct {
	declare public readonly ['constructor']: typeof SubUmbrellaCommand;

	/**
	 * Command type.
	 */
	declare public cmd: number;

	/**
	 * Command size.
	 */
	declare public cmdsize: number;

	/**
	 * The sub_umbrella framework name.
	 */
	// eslint-disable-next-line max-len
	declare public readonly subUmbrella:
		this['constructor']['LcStr']['prototype'];

	/**
	 * LcStr reference.
	 */
	public static readonly LcStr = LcStr;

	/**
	 * @inheritdoc
	 */
	public static override readonly BYTE_LENGTH = ((o) => {
		o += structU32(this, o, 'cmd');
		o += structU32(this, o, 'cmdsize');
		o += structT(this, o, 'subUmbrella', 'LcStr');
		return o;
	})(super.BYTE_LENGTH);
}

/**
 * Sub umbrella command, big endian.
 */
export class SubUmbrellaCommandBE extends SubUmbrellaCommand {
	declare public readonly ['constructor']: typeof SubUmbrellaCommandBE;

	/**
	 * @inheritdoc
	 */
	public static override readonly LITTLE_ENDIAN = false;

	/**
	 * @inheritdoc
	 */
	public static override readonly LcStr = LcStrBE;
}

/**
 * Sub umbrella command, little endian.
 */
export class SubUmbrellaCommandLE extends SubUmbrellaCommand {
	declare public readonly ['constructor']: typeof SubUmbrellaCommandLE;

	/**
	 * @inheritdoc
	 */
	public static override readonly LITTLE_ENDIAN = true;

	/**
	 * @inheritdoc
	 */
	public static override readonly LcStr = LcStrBE;
}