from flask import Blueprint, request, jsonify, render_template, current_app
from flask_uploads import UploadNotAllowed
from flask_login import current_user

from blogs.models.blogs import File, User, Notification, Post
from blogs.extensions import db, files
from blogs.utils import resize_image

ajax_bp = Blueprint('ajax', __name__)

file_list = []


@ajax_bp.route('/upload/', methods=['POST'])
def upload():
    if request.method == 'POST' and 'file' in request.files:
        filename = request.files['file'].filename
        filename = filename.encode('utf-8').decode('utf-8')
        try:
            filename = files.save(request.files['file'], name=filename)
        except(UploadNotAllowed):
            return jsonify(message='文件格式不支持'), 405
        else:
            file_list.append(filename)
            filename_s = None
            if filename.rsplit('.', 1)[1] in ['jpg', 'png', 'jpeg', 'gif', 'PNG', 'bmp']:
                filename_s = resize_image(request.files['file'], filename, current_app.config['PHOTO_SIZE']['small'])
            file = File(filename=filename, filename_s=filename_s)
            db.session.add(file)
            db.session.commit()
            return filename


@ajax_bp.route('/<filename>')
def get_filename(filename):
    return render_template('list.html', filename=filename)


@ajax_bp.route('/d/<path:filename>', methods=['DELETE'])
def delete_file(filename):
    file = File.query.filter_by(filename=filename).first()
    db.session.delete(file)
    db.session.commit()
    return '', 204


@ajax_bp.route('/get_profile/<int:user_id>')
def get_profile(user_id):
    if not current_user.is_authenticated:
        return jsonify(message='请先登录'), 403
    user = User.query.get_or_404(user_id)
    return render_template('main/profile_popup.html', user=user)


@ajax_bp.route('/notifications-count')
def notifications_count():
    if not current_user.is_authenticated:
        return jsonify(message='请先登录'), 403

    count = Notification.query.with_parent(current_user).filter_by(is_read=False).count()
    return jsonify(count=count)
