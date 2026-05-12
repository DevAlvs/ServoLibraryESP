/*！
 * @file pxt-motor/main.ts
 * @brief DFRobot's microbit motor drive makecode library.
 * @n [Get the module here](http://www.dfrobot.com.cn/goods-1577.html)
 * @n This is the microbit special motor drive library, which realizes control 
 *    of the eight-channel steering gear, two-step motor and four-way dc motor.
 *
 * @copyright	[DFRobot](http://www.dfrobot.com), 2016
 * @copyright	GNU Lesser General Public License
 *
 * @author [email](1035868977@qq.com)
 * @version  V1.0.1
 * @date  2018-03-20
 */
 
/**
 *This is DFRobot:motor user motor and steering control function.
 */
//% weight=10 color=#DF6721 icon="\uf013" block="DF-Driver"
namespace motor {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD
 
    const STP_CHA_L = 2047
    const STP_CHA_H = 4095
 
    const STP_CHB_L = 1
    const STP_CHB_H = 2047
 
    const STP_CHC_L = 1023
    const STP_CHC_H = 3071
 
    const STP_CHD_L = 3071
    const STP_CHD_H = 1023
 
 
    const BYG_CHA_L = 3071
    const BYG_CHA_H = 1023
 
    const BYG_CHB_L = 1023
    const BYG_CHB_H = 3071
 
    const BYG_CHC_L = 4095
    const BYG_CHC_H = 2047
 
    const BYG_CHD_L = 2047
    const BYG_CHD_H = 4095
 
    /**
     * The user can choose the step motor model.
     */
    export enum MotorPaso {
        //% block="42"
        Ste1 = 1,
        //% block="28"
        Ste2 = 2
    }
 
    /**
     * The user can select the 8 steering gear controller.
     */
    export enum Servos {
        S1 = 0x08,
        S2 = 0x07,
        S3 = 0x06,
        S4 = 0x05,
        S5 = 0x04,
        S6 = 0x03,
        S7 = 0x02,
        S8 = 0x01
    }
 
    /**
     * The user selects the 4-way dc motor.
     */
    export enum Motores {
        M1 = 0x1,
        M2 = 0x2,
        M3 = 0x3,
        M4 = 0x4
    }
 
    /**
     * The user defines the motor rotation direction.
     */
    export enum Direccion {
        //% blockId="CW" block="Horario"
        CW = 1,
        //% blockId="CCW" block="Antihorario"
        CCW = -1,
    }
 
    /**
     * The user can select a two-path stepper motor controller.
     */
    export enum MotoresPaso {
        M1_M2 = 0x1,
        M3_M4 = 0x2
    }
 
 
 
    let initialized = false
 
    function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }
 
    function i2cCmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }
 
    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }
 
    function initPCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }
 
    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval;//Math.floor(prescaleval + 0.5);
        let oldmode = i2cRead(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cWrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }
 
    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
 
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }
 
 
    function setStepper_28(index: number, dir: boolean): void {
        if (index == 1) {
            if (dir) {
                setPwm(4, STP_CHA_L, STP_CHA_H);
                setPwm(6, STP_CHB_L, STP_CHB_H);
                setPwm(5, STP_CHC_L, STP_CHC_H);
                setPwm(7, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(7, STP_CHA_L, STP_CHA_H);
                setPwm(5, STP_CHB_L, STP_CHB_H);
                setPwm(6, STP_CHC_L, STP_CHC_H);
                setPwm(4, STP_CHD_L, STP_CHD_H);
            }
        } else {
            if (dir) {
                setPwm(0, STP_CHA_L, STP_CHA_H);
                setPwm(2, STP_CHB_L, STP_CHB_H);
                setPwm(1, STP_CHC_L, STP_CHC_H);
                setPwm(3, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(3, STP_CHA_L, STP_CHA_H);
                setPwm(1, STP_CHB_L, STP_CHB_H);
                setPwm(2, STP_CHC_L, STP_CHC_H);
                setPwm(0, STP_CHD_L, STP_CHD_H);
            }
        }
    }
 
 
    function setStepper_42(index: number, dir: boolean): void {
        if (index == 1) {
            if (dir) {
                setPwm(7, BYG_CHA_L, BYG_CHA_H);
                setPwm(6, BYG_CHB_L, BYG_CHB_H);
                setPwm(5, BYG_CHC_L, BYG_CHC_H);
                setPwm(4, BYG_CHD_L, BYG_CHD_H);
            } else {
                setPwm(7, BYG_CHC_L, BYG_CHC_H);
                setPwm(6, BYG_CHD_L, BYG_CHD_H);
                setPwm(5, BYG_CHA_L, BYG_CHA_H);
                setPwm(4, BYG_CHB_L, BYG_CHB_H);
            }
        } else {
            if (dir) {
                setPwm(3, BYG_CHA_L, BYG_CHA_H);
                setPwm(2, BYG_CHB_L, BYG_CHB_H);
                setPwm(1, BYG_CHC_L, BYG_CHC_H);
                setPwm(0, BYG_CHD_L, BYG_CHD_H);
            } else {
                setPwm(3, BYG_CHC_L, BYG_CHC_H);
                setPwm(2, BYG_CHD_L, BYG_CHD_H);
                setPwm(1, BYG_CHA_L, BYG_CHA_H);
                setPwm(0, BYG_CHB_L, BYG_CHB_H);
            }
        }
    }
 
 
    /**
	 * Steering gear control function.
     * S1~S8.
     * 0°~180°.
	*/
    //% blockId=motor_servo block="Servo|%index|grados|%grados"
    //% weight=100
    //% grados.min=0 grados.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function servo(index: Servos, grados: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz
        let v_us = (grados * 1800 / 180 + 600) // 0.6ms ~ 2.4ms
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }
 
    /**
	 * Execute a motor
     * M1~M4.
     * speed(0~255).
    */
    //% weight=90
    //% blockId=motor_MotorCorrer block="Motor|%index|direccion|%Direccion|velocidad|%velocidad"
    //% velocidad.min=0 velocidad.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direccion.fieldEditor="gridpicker" direccion.fieldOptions.columns=2
    export function MotorCorrer(index: Motores, direccion: Direccion, velocidad: number): void {
        if (!initialized) {
            initPCA9685()
        }
        velocidad = velocidad * 16 * direccion; // map 255 to 4096
        if (velocidad >= 4096) {
            velocidad = 4095
        }
        if (velocidad <= -4096) {
            velocidad = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pn = (4 - index) * 2
        let pp = (4 - index) * 2 + 1
        if (velocidad >= 0) {
            setPwm(pp, 0, velocidad)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -velocidad)
        }
    }
 
    /**
	 * Execute a 42BYGH1861A-C step motor(Degree).
     * M1_M2/M3_M4.
    */
    //% weight=80
    //% blockId=motor_pasosGrados_42 block="Motor Paso 42|%index|direccion|%direccion|grados|%grados"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direccion.fieldEditor="gridpicker" direccion.fieldOptions.columns=2
    export function pasosGrados_42(index: MotoresPaso, direccion: Direccion, grados: number): void {
        if (!initialized) {
            initPCA9685()
        }
        setStepper_42(index, direccion > 0);
        if (grados == 0) {
            return;
        }
        let Grados = Math.abs(grados);
        basic.pause((50000 * Grados) / (360 * 100));  //100hz
        if (index == 1) {
            motorParar(1)
            motorParar(2)
        } else {
            motorParar(3)
            motorParar(4)
        }
    }
 
    /**
	 * Execute a 42BYGH1861A-C step motor(Turn).
     * M1_M2/M3_M4.
    */
    //% weight=70
    //% blockId=motor_pasosVueltas_42 block="Motor Paso 42|%index|direccion|%direccion|vueltas|%vueltas"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direccion.fieldEditor="gridpicker" direccion.fieldOptions.columns=2
    export function pasosVueltas_42(index: MotoresPaso, direccion: Direccion, vueltas: number): void {
        if (vueltas == 0) {
            return;
        }
        let grados = vueltas * 360;
        pasosGrados_42(index, direccion, grados);
    }
 
    /**
	 * Execute a 28BYJ-48 step motor(Degree).
     * M1_M2/M3_M4.
    */
    //% weight=60
    //% blockId=motor_pasosGrados_28 block="Motor Paso 28|%index|direccion|%direccion|grados|%grados"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direccion.fieldEditor="gridpicker" direccion.fieldOptions.columns=2
    export function pasosGrados_28(index: MotoresPaso, direccion: Direccion, grados: number): void {
        if (!initialized) {
            initPCA9685()
        }
        if (grados == 0) {
            return;
        }
        let Grados = Math.abs(grados);
        Grados = Grados * direccion;
        setStepper_28(index, Grados > 0);
        Grados = Math.abs(Grados);
        basic.pause((1000 * Grados) / 360);
        if (index == 1) {
            motorParar(1)
            motorParar(2)
        } else {
            motorParar(3)
            motorParar(4)
        }
    }
 
    /**
	 * Execute a 28BYJ-48 step motor(Turn).
     * M1_M2/M3_M4.
    */
    //% weight=50
    //% blockId=motor_pasosVueltas_28 block="Motor Paso 28|%index|direccion|%direccion|vueltas|%vueltas"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direccion.fieldEditor="gridpicker" direccion.fieldOptions.columns=2
    export function pasosVueltas_28(index: MotoresPaso, direccion: Direccion, vueltas: number): void {
        if (vueltas == 0) {
            return;
        }
        let grados = vueltas * 360;
        pasosGrados_28(index, direccion, grados);
    }
 
    /**
	 * Two parallel stepper motors are executed simultaneously(DegreeDual).
    */
    //% weight=40
    //% blockId=motor_pasosGradosDual_42 block="Doble Motor Paso %motorPaso|M1_M2 dir %direccion1|grados %grados1|M3_M4 dir %direccion2|grados %grados2"
    //% motorPaso.fieldEditor="gridpicker" motorPaso.fieldOptions.columns=2
    //% direccion1.fieldEditor="gridpicker" direccion1.fieldOptions.columns=2
    //% direccion2.fieldEditor="gridpicker" direccion2.fieldOptions.columns=2
    export function pasosGradosDual_42(motorPaso: MotorPaso, direccion1: Direccion, grados1: number, direccion2: Direccion, grados2: number): void {
        if (!initialized) {
            initPCA9685()
        }
        let tiempo1 = 0;
        let tiempo2 = 0;
        let Grados1 = Math.abs(grados1);
        let Grados2 = Math.abs(grados2);
 
        if (motorPaso == 1) {  // 42 stepper
            if (Grados1 == 0 && Grados2 == 0) {
                setStepper_42(0x01, direccion1 > 0);
                setStepper_42(0x02, direccion2 > 0);
            } else if ((Grados1 == 0) && (Grados2 > 0)) {
                tiempo1 = (50000 * Grados2) / (360 * 100)
                setStepper_42(0x01, direccion1 > 0);
                setStepper_42(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(3); motorParar(4);
            } else if ((Grados2 == 0) && (Grados1 > 0)) {
                tiempo1 = (50000 * Grados1) / (360 * 100)
                setStepper_42(0x01, direccion1 > 0);
                setStepper_42(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(1); motorParar(2);
            } else if ((Grados2 > Grados1)) {
                tiempo1 = (50000 * Grados1) / (360 * 100)
                tiempo2 = (50000 * (Grados2 - Grados1)) / (360 * 100)
                setStepper_42(0x01, direccion1 > 0);
                setStepper_42(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(1); motorParar(2);
                basic.pause(tiempo2);
                motorParar(3); motorParar(4);
            } else if ((Grados2 < Grados1)) {
                tiempo1 = (50000 * Grados2) / (360 * 100)
                tiempo2 = (50000 * (Grados1 - Grados2)) / (360 * 100)
                setStepper_42(0x01, direccion1 > 0);
                setStepper_42(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(3); motorParar(4);
                basic.pause(tiempo2);
                motorParar(1); motorParar(2);
            }
        } else if (motorPaso == 2) {
            if (Grados1 == 0 && Grados2 == 0) {
                setStepper_28(0x01, direccion1 > 0);
                setStepper_28(0x02, direccion2 > 0);
            } else if ((Grados1 == 0) && (Grados2 > 0)) {
                tiempo1 = (50000 * Grados2) / (360 * 100)
                setStepper_28(0x01, direccion1 > 0);
                setStepper_28(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(3); motorParar(4);
            } else if ((Grados2 == 0) && (Grados1 > 0)) {
                tiempo1 = (50000 * Grados1) / (360 * 100)
                setStepper_28(0x01, direccion1 > 0);
                setStepper_28(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(1); motorParar(2);
            } else if ((Grados2 > Grados1)) {
                tiempo1 = (50000 * Grados1) / (360 * 100)
                tiempo2 = (50000 * (Grados2 - Grados1)) / (360 * 100)
                setStepper_28(0x01, direccion1 > 0);
                setStepper_28(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(1); motorParar(2);
                basic.pause(tiempo2);
                motorParar(3); motorParar(4);
            } else if ((Grados2 < Grados1)) {
                tiempo1 = (50000 * Grados2) / (360 * 100)
                tiempo2 = (50000 * (Grados1 - Grados2)) / (360 * 100)
                setStepper_28(0x01, direccion1 > 0);
                setStepper_28(0x02, direccion2 > 0);
                basic.pause(tiempo1);
                motorParar(3); motorParar(4);
                basic.pause(tiempo2);
                motorParar(1); motorParar(2);
            }
        } else {
            //
        }
    }
 
    /**
	 * Two parallel stepper motors are executed simultaneously(Turn).
    */
    //% weight=30
    //% blockId=motor_pasosVueltasDual_42 block="Doble Motor Paso %motorPaso|M1_M2 dir %direccion1|vueltas %vueltas1|M3_M4 dir %direccion2|vueltas %vueltas2"
    //% motorPaso.fieldEditor="gridpicker" motorPaso.fieldOptions.columns=2
    //% direccion1.fieldEditor="gridpicker" direccion1.fieldOptions.columns=2
    //% direccion2.fieldEditor="gridpicker" direccion2.fieldOptions.columns=2
    export function pasosVueltasDual_42(motorPaso: MotorPaso, direccion1: Direccion, vueltas1: number, direccion2: Direccion, vueltas2: number): void {
        if ((vueltas1 == 0) && (vueltas2 == 0)) {
            return;
        }
        let grados1 = vueltas1 * 360;
        let grados2 = vueltas2 * 360;
 
        if (motorPaso == 1) {
            pasosGradosDual_42(motorPaso, direccion1, grados1, direccion2, grados2);
        } else if (motorPaso == 2) {
            pasosGradosDual_42(motorPaso, direccion1, grados1, direccion2, grados2);
        } else {
 
        }
 
    }
 
    /**
	 * Stop the dc motor.
    */
    //% weight=20
    //% blockId=motor_motorParar block="Parar Motor|%index"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2 
    export function motorParar(index: Motores) {
        setPwm((4 - index) * 2, 0, 0);
        setPwm((4 - index) * 2 + 1, 0, 0);
    }
 
    /**
	 * Stop all motors
    */
    //% weight=10
    //% blockId=motor_pararTodo block="Parar Todo"
    export function pararTodo(): void {
        for (let idx = 1; idx <= 4; idx++) {
            motorParar(idx);
        }
    }
}
