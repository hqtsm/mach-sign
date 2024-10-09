/* eslint-disable max-classes-per-file */
import {Struct, structI32, structI8A, structU32, structU64} from '../struct.ts';
import {constant} from '../util.ts';

/**
 * Segment command, 64-bit.
 */
export class SegmentCommand64 extends Struct {
	public declare readonly ['constructor']: typeof SegmentCommand64;

	/**
	 * Command type.
	 */
	public declare cmd: number;

	/**
	 * Command size.
	 */
	public declare cmdsize: number;

	/**
	 * Segment name.
	 */
	public declare readonly segname: Int8Array;

	/**
	 * Virtual memory address.
	 */
	public declare vmaddr: bigint;

	/**
	 * Virtual memory size.
	 */
	public declare vmsize: bigint;

	/**
	 * File offset.
	 */
	public declare fileoff: bigint;

	/**
	 * File size.
	 */
	public declare filesize: bigint;

	/**
	 * Maximum virtual memory protection.
	 */
	public declare maxprot: number;

	/**
	 * Initial virtual memory protection.
	 */
	public declare initprot: number;

	/**
	 * Number of sections.
	 */
	public declare nsects: number;

	/**
	 * Flags.
	 */
	public declare flags: number;

	static {
		let {BYTE_LENGTH: o} = this;
		o += structU32(this, o, 'cmd');
		o += structU32(this, o, 'cmdsize');
		o += structI8A(this, o, 'segname', 16);
		o += structU64(this, o, 'vmaddr');
		o += structU64(this, o, 'vmsize');
		o += structU64(this, o, 'fileoff');
		o += structU64(this, o, 'filesize');
		o += structI32(this, o, 'maxprot');
		o += structI32(this, o, 'initprot');
		o += structU32(this, o, 'nsects');
		o += structU32(this, o, 'flags');
		constant(this, 'BYTE_LENGTH', o);
	}
}

/**
 * Segment command, 64-bit, big endian.
 */
export class SegmentCommand64BE extends SegmentCommand64 {
	/**
	 * @inheritdoc
	 */
	public static readonly LITTLE_ENDIAN = false;

	static {
		constant(this, 'LITTLE_ENDIAN');
	}
}

/**
 * Segment command, 64-bit, little endian.
 */
export class SegmentCommand64LE extends SegmentCommand64 {
	/**
	 * @inheritdoc
	 */
	public static readonly LITTLE_ENDIAN = true;

	static {
		constant(this, 'LITTLE_ENDIAN');
	}
}
