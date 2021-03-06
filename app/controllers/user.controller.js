const db = require("../models");
const User = db.user;
var bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const transport = require("../config/email.config");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
}

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
}

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
}

exports.update = async (req, res) => {
    let id = req.userid;
    let user = req.body;
    console.log(user);
    try {
        let data = await User.update(user, { where: { id: id } });
        if(data == 1){
            user = await User.findByPk(id, { attributes: ['id', 'username', 'fullname','email', 'phonenumber', 'address', 'gender'] });
            res.status(200).json(user);
        }else{
            res.status(200).json({
                message: `Can not update with username: ${user.username}!`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.findUserById = async (req, res) => {
    let id = req.userid;
    try {
        let user = await User.findByPk(id, { attributes: ['id', 'username', 'fullname', 'email', 'phonenumber', 'address', 'avatar'] });
        if(user != null){
            return res.status(200).json(user);
        }else{
            return res.status(200).json({
                message: `Can not find with id: ${id}!`
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}

exports.changePassword = async (req, res) => {
    let id = req.userid;
    let { oldpassword, newpassword } = req.body;
    try {
        var user = await User.findByPk(id);
        if(bcrypt.compareSync(oldpassword, user.password)){
            await User.update({ password: bcrypt.hashSync(newpassword, 12) }, { where: { id: id } });
            let afterUser = await User.findByPk(id);
            let content = `<p style="color: black;">Tài khoản <b>${afterUser.username}</b> đã được thay đổi mật khẩu vào lúc ${afterUser.updatedAt}.</p>`;
            content += `<p style="color: black;">Hãy chắc chắn rằng đó là bạn và liên hệ tới hòm thư ${transport.auth.user} để biết thêm thông tin chi tiết.</p>`;
            const mailOptions = {
                from: transport.auth.user,
                to: afterUser.email,
                subject: "Xác thực thay đổi mật khẩu!",
                html: content
            }
            // transporter.
            await transporter.sendMail(mailOptions);
            return res.status(200).json({
                message: "Thay đổi mật khẩu thành công!"
            });
        }
        return res.status(200).json({
            error: "Mật khẩu không hợp lệ!"
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}

exports.uploadAvatar = async (req, res) => {
    try {
        let path = req.file.path.split('\\')[2];
        if (path.length > 0) {
            await User.update({ avatar: path }, { where: { id: req.userid } });
            return res.status(200).json({
                message: "Thay đổi ảnh đại diện thành công!"
            });
        }
        return res.status(200).json({
            error: "Có lỗi xảy ra!"
        });
    } catch (error) {
        return res.status(200).json({
            error: error.message
        });
    }
}

exports.getAllUser = async (req, res) => {
    try {
        let data = await User.findAll({ where: { status: true } });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}

const transporter = nodemailer.createTransport({
    service: transport.service,
    auth: {
        user: transport.auth.user,
        pass: transport.auth.pass
    }
});
